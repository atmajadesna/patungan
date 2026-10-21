/* patungan. — pembagian tagihan dengan pembulatan yang selalu pas.
 * Metode: proporsi per item -> pajak/service proporsional -> pembulatan
 * ke kelipatan `step` dengan largest remainder, sehingga jumlah semua
 * bagian tepat sama dengan total yang ditagih.
 */
(() => {
  "use strict";

  const STORE = "patungan.v1";
  const rupiah = new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 });
  const angka = new Intl.NumberFormat("id-ID");

  const el = (id) => document.getElementById(id);

  let state = {
    mode: "item",
    totalRata: 285000,
    pajak: 10,
    service: 5,
    step: 500,
    people: ["Kamu", "Bagas", "Citra"],
    items: [
      { id: 1, nama: "Nasi goreng", harga: 45000, peserta: ["Kamu", "Bagas"] },
      { id: 2, nama: "Es teh", harga: 12000, peserta: ["Kamu", "Bagas", "Citra"] },
      { id: 3, nama: "Ayam bakar", harga: 55000, peserta: ["Citra"] },
    ],
  };
  let seq = 100;

  // ---------- util ----------
  const digit = (v) => Number(String(v).replace(/[^\d]/g, "")) || 0;
  const fmt = (n) => rupiah.format(Math.round(n)).replace(/\s/g, " ");

  function simpan() {
    try { localStorage.setItem(STORE, JSON.stringify(state)); } catch { /* abaikan */ }
  }

  function muat() {
    try {
      const raw = localStorage.getItem(STORE);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (parsed && Array.isArray(parsed.people) && Array.isArray(parsed.items)) state = { ...state, ...parsed };
    } catch { /* pakai bawaan */ }
  }

  // ---------- hitung ----------
  function hitung() {
    const orang = state.people.length;
    const kosong = { subtotal: 0, total: 0, terkumpul: 0, selisih: 0, bagian: [] };
    if (orang === 0) return kosong;

    if (state.mode === "rata") {
      const total = state.totalRata;
      const bagian = bagiRata(total, orang);
      return {
        subtotal: total,
        total,
        terkumpul: bagian.reduce((a, b) => a + b, 0),
        selisih: 0,
        bagian: state.people.map((nama, i) => ({ nama, nominal: bagian[i] })),
        faktor: 1,
      };
    }

    const subtotal = state.items.reduce((a, it) => a + it.harga, 0);
    const faktor = 1 + (Number(state.pajak) + Number(state.service)) / 100;

    // porsi dasar per orang (sebelum pajak)
    const dasar = new Map(state.people.map((p) => [p, 0]));
    state.items.forEach((it) => {
      const peserta = it.peserta.filter((p) => dasar.has(p));
      if (!peserta.length || it.harga <= 0) return;
      const porsi = it.harga / peserta.length;
      peserta.forEach((p) => dasar.set(p, dasar.get(p) + porsi));
    });

    const tepat = state.people.map((nama) => ({ nama, nilai: dasar.get(nama) * faktor }));
    const totalTepat = subtotal * faktor;
    const step = Number(state.step) || 1;
    const target = Math.ceil(totalTepat / step) * step;

    const bagian = bagiDenganSisa(tepat, target, step);
    const terkumpul = bagian.reduce((a, b) => a + b, 0);

    return {
      subtotal,
      total: totalTepat,
      target,
      terkumpul,
      selisih: terkumpul - totalTepat,
      faktor,
      bagian: state.people.map((nama, i) => ({ nama, nominal: bagian[i] })),
    };
  }

  function bagiRata(total, n) {
    const step = Number(state.step) || 1;
    const target = Math.ceil(total / step) * step;
    const dasar = Array.from({ length: n }, () => total / n);
    return bagiDenganSisa(dasar.map((v, i) => ({ nama: String(i), nilai: v })), target, step);
  }

  // largest remainder: setiap orang dapat kelipatan `step` ke bawah,
  // sisa unit dibagikan ke yang pecahannya terbesar.
  function bagiDenganSisa(tepat, target, step) {
    const unit = tepat.map((o) => Math.floor(o.nilai / step));
    const sisa = tepat.map((o) => o.nilai - Math.floor(o.nilai / step) * step);
    const butuh = Math.max(0, Math.round(target / step) - unit.reduce((a, b) => a + b, 0));
    const urut = tepat
      .map((o, i) => ({ i, sisa: sisa[i] }))
      .sort((a, b) => b.sisa - a.sisa);
    for (let k = 0; k < butuh; k += 1) {
      if (!urut.length) break;
      unit[urut[k % urut.length].i] += 1;
    }
    return unit.map((u) => u * step);
  }

  // ---------- render ----------
  function render() {
    const hasil = hitung();
    const orang = state.people.length;

    // hero — angka terbesar, bukan rata-rata: itu yang paling perlu diketahui
    const urut = [...hasil.bagian].sort((a, b) => b.nominal - a.nominal);
    const puncak = urut[0];
    const rata = orang ? hasil.terkumpul / orang : 0;
    const porsi = hasil.terkumpul ? Math.round((puncak.nominal / hasil.terkumpul) * 100) : 0;

    el("hero-label").textContent = state.mode === "rata" ? "Per orang" : "Paling banyak bayar";
    el("hero-value").innerHTML = `${fmt(puncak ? puncak.nominal : 0)}${state.mode === "rata" ? "<small> / orang</small>" : `<small> · ${esc(puncak ? puncak.nama : "")}</small>`}`;
    el("stat-tagihan").textContent = fmt(hasil.terkumpul);
    el("stat-orang").textContent = String(orang);
    el("stat-pajak").textContent = state.mode === "rata" ? "—" : `${Number(state.pajak) + Number(state.service)}%`;
    el("stat-rata").textContent = fmt(rata);
    el("hero-sub").textContent = orang
      ? (state.mode === "rata"
        ? `Dibagi rata untuk ${orang} orang, total ${fmt(hasil.terkumpul)}.`
        : `${puncak.nama} menanggung ${porsi}% dari total. Sisanya ${orang - 1} orang mulai ${fmt(urut[urut.length - 1].nominal)}.`)
      : "Tambahkan minimal satu orang untuk mulai menghitung.";

    // mode
    el("mode-rata").setAttribute("aria-pressed", String(state.mode === "rata"));
    el("mode-item").setAttribute("aria-pressed", String(state.mode === "item"));
    el("panel-rata").hidden = state.mode !== "rata";
    el("panel-item").hidden = state.mode !== "item";

    // orang
    el("people").innerHTML = state.people.map((p) => `
      <span class="chip chip--orang">${esc(p)}
        <button type="button" class="chip__x" data-hapus-orang="${esc(p)}" aria-label="Hapus ${esc(p)}">×</button>
      </span>`).join("");

    // item
    el("items").innerHTML = state.items.map((it) => `
      <div class="item" data-id="${it.id}">
        <input class="item__nama" value="${esc(it.nama)}" aria-label="Nama item" placeholder="Nama item">
        <input class="item__harga" value="${angka.format(it.harga)}" inputmode="numeric" aria-label="Harga item">
        <button type="button" class="item__hapus" data-hapus-item="${it.id}" aria-label="Hapus item">×</button>
        <div class="item__peserta">
          ${state.people.map((p) => `<button type="button" class="chip" data-peserta="${it.id}" data-orang="${esc(p)}"
             aria-pressed="${it.peserta.includes(p)}">${esc(p)}</button>`).join("")}
        </div>
      </div>`).join("");

    // hasil
    const maks = Math.max(1, ...hasil.bagian.map((b) => b.nominal));
    el("hasil").innerHTML = hasil.bagian.length
      ? hasil.bagian.map((b) => `
        <li class="hasil__row">
          <span class="hasil__nama">${esc(b.nama)}</span>
          <span class="hasil__nilai">${fmt(b.nominal)}</span>
          <span class="hasil__bar"><i style="width:${Math.max(2, (b.nominal / maks) * 100).toFixed(1)}%"></i></span>
        </li>`).join("")
      : '<li class="hasil__row"><span class="hasil__nama">Belum ada orang.</span></li>';

    // catatan pembulatan
    const note = el("note");
    if (state.mode === "item" && hasil.total > 0) {
      const lebih = hasil.terkumpul - hasil.total;
      note.hidden = false;
      note.innerHTML = `Tagihan tepat <b>${fmt(hasil.total)}</b> · terkumpul <b>${fmt(hasil.terkumpul)}</b> · ` +
        (Math.abs(lebih) < 1 ? "pas, tanpa selisih." : `selisih <b>${lebih > 0 ? "+" : "−"}${fmt(Math.abs(lebih))}</b> ${lebih > 0 ? "masuk kas." : "perlu ditambal."}`);
    } else {
      note.hidden = true;
    }

    el("hasil-catatan").textContent = orang ? `${orang} orang` : "";

    if (state.mode === "item") {
      el("pajak").value = state.pajak;
      el("service").value = state.service;
    } else {
      el("total-rata").value = angka.format(state.totalRata);
    }
    el("step").value = String(state.step);

    simpan();
  }

  function esc(s) {
    return String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  }

  // ---------- event ----------
  document.addEventListener("click", (e) => {
    const t = e.target;

    if (t.id === "mode-rata" || t.id === "mode-item") {
      state.mode = t.id === "mode-rata" ? "rata" : "item";
      render();
      return;
    }
    if (t.id === "tambah-item") {
      state.items.push({ id: ++seq, nama: "", harga: 0, peserta: [...state.people] });
      render();
      const inputs = document.querySelectorAll(".item__nama");
      if (inputs.length) inputs[inputs.length - 1].focus();
      return;
    }
    if (t.dataset.hapusItem) {
      state.items = state.items.filter((it) => it.id !== Number(t.dataset.hapusItem));
      render();
      return;
    }
    if (t.dataset.peserta) {
      const item = state.items.find((it) => it.id === Number(t.dataset.peserta));
      if (!item) return;
      const orang = t.dataset.orang;
      item.peserta = item.peserta.includes(orang)
        ? item.peserta.filter((p) => p !== orang)
        : [...item.peserta, orang];
      render();
      return;
    }
    if (t.dataset.hapusOrang) {
      const nama = t.dataset.hapusOrang;
      state.people = state.people.filter((p) => p !== nama);
      state.items.forEach((it) => { it.peserta = it.peserta.filter((p) => p !== nama); });
      render();
      return;
    }
    if (t.id === "tambah-orang") {
      tambahOrang();
    }
  });

  function tambahOrang() {
    const input = el("nama-baru");
    const nama = input.value.trim();
    if (!nama) { input.focus(); return; }
    if (state.people.includes(nama)) { input.value = ""; return; }
    state.people.push(nama);
    state.items.forEach((it) => { if (!it.peserta.length) it.peserta.push(nama); });
    input.value = "";
    render();
    input.focus();
  }

  document.addEventListener("input", (e) => {
    const t = e.target;
    if (t.id === "total-rata") {
      state.totalRata = digit(t.value);
      const pos = t.selectionStart;
      render();
      const f = el("total-rata");
      if (document.activeElement !== f) f.focus();
      try { f.setSelectionRange(pos, pos); } catch { /* abaikan */ }
      return;
    }
    if (t.id === "pajak" || t.id === "service") {
      state[t.id] = Number(t.value) || 0;
      render();
      return;
    }
    const item = t.closest(".item");
    if (!item) return;
    const data = state.items.find((it) => it.id === Number(item.dataset.id));
    if (!data) return;
    if (t.classList.contains("item__nama")) {
      data.nama = t.value;
      simpan();
    }
    if (t.classList.contains("item__harga")) {
      data.harga = digit(t.value);
      const pos = t.selectionStart;
      t.value = angka.format(data.harga);
      try { t.setSelectionRange(pos, pos); } catch { /* abaikan */ }
      render();
    }
  });

  document.addEventListener("change", (e) => {
    if (e.target.id === "step") {
      state.step = Number(e.target.value) || 1;
      render();
    }
  });

  el("nama-baru").addEventListener("keydown", (e) => {
    if (e.key === "Enter") { e.preventDefault(); tambahOrang(); }
  });

  muat();
  render();
})();
