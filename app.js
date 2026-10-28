const filmListesi = document.querySelector("#film-listesi");
const filmFormu = document.querySelector("#film-formu");
const filmAdiInput = document.querySelector("#film-adi");
const filmTuruInput = document.querySelector("#film-turu");
const filmAramaInput = document.querySelector("#film-arama");
const mesaj = document.querySelector("#mesaj");
const ozet = document.querySelector("#ozet");

const depolamaAnahtari = "film-listem";

const baslangicFilmleri = [
  {
    id: "1",
    ad: "Interstellar",
    tur: "Bilim Kurgu",
    izlendi: false
  },
  {
    id: "2",
    ad: "Inception",
    tur: "Bilim Kurgu",
    izlendi: true
  },
  {
    id: "3",
    ad: "The Green Mile",
    tur: "Dram",
    izlendi: false
  }
];

// Kaydedilmiş filmleri okur.
const filmleriYukle = () => {
  try {
    const metin = localStorage.getItem(depolamaAnahtari);

    if (metin === null) {
      return baslangicFilmleri;
    }

    const veriler = JSON.parse(metin);

    // Kayıtların beklediğimiz yapıda olduğunu kontrol eder.
    if (!Array.isArray(veriler)) {
      throw new Error("Film verisi bir dizi olmalı.");
    }

    const gecerli = veriler.every(film =>
      film !== null &&
      typeof film === "object" &&
      typeof film.id === "string" &&
      typeof film.ad === "string" &&
      typeof film.tur === "string" &&
      typeof film.izlendi === "boolean"
    );

    if (!gecerli) {
      throw new Error("Film kayıtlarının biçimi geçersiz.");
    }

    return veriler;
  } catch (hata) {
    console.error(hata);
    mesaj.textContent =
      "Eski kayıtlar okunamadı. Başlangıç listesi gösteriliyor.";

    return baslangicFilmleri;
  }
};

let filmler = filmleriYukle();

// Diziyi JSON metnine çevirip tarayıcıya kaydeder.
const filmleriKaydet = () => {
  try {
    localStorage.setItem(
      depolamaAnahtari,
      JSON.stringify(filmler)
    );

    return true;
  } catch (hata) {
    console.error(hata);
    mesaj.textContent =
      "Değişiklik ekranda yapıldı ancak tarayıcıya kaydedilemedi.";

    return false;
  }
};

// Seçilen filmin izlenme durumunu tersine çevirir.
const durumDegistir = (id) => {
  const secilenFilm = filmler.find(film => film.id === id);

  if (!secilenFilm) {
    return;
  }

  filmler = filmler.map(film =>
    film.id === id
      ? { ...film, izlendi: !film.izlendi }
      : film
  );

  if (filmleriKaydet()) {
    mesaj.textContent = `${secilenFilm.ad} güncellendi.`;
  }

  filmleriGoster();
};

// Seçilen film dışındaki kayıtları tutar.
const filmSil = (id) => {
  filmler = filmler.filter(film => film.id !== id);

  if (filmleriKaydet()) {
    mesaj.textContent = "Film silindi.";
  }

  filmleriGoster();
};

// Filmleri arama metnine göre ekranda gösterir.
const filmleriGoster = () => {
  filmListesi.replaceChildren();

  const arama = filmAramaInput.value
    .trim()
    .toLocaleLowerCase("tr-TR");

  const gorunenFilmler = filmler.filter(film =>
    film.ad.toLocaleLowerCase("tr-TR").includes(arama)
  );

  const izlenenSayisi = filmler.filter(
    film => film.izlendi
  ).length;

  ozet.textContent =
    `Toplam: ${filmler.length} film | İzlenen: ${izlenenSayisi}`;

  if (gorunenFilmler.length === 0) {
    const bilgi = document.createElement("li");
    bilgi.textContent = "Gösterilecek film bulunamadı.";
    filmListesi.appendChild(bilgi);
    return;
  }

  gorunenFilmler.forEach(film => {
    const { id, ad, tur, izlendi } = film;

    const satir = document.createElement("li");
    const bilgi = document.createElement("span");
    const islemler = document.createElement("div");

    islemler.className = "islemler";

    bilgi.textContent =
      `${ad} — ${tur} — ${izlendi ? "İzlendi" : "İzlenecek"}`;

    const durumButonu = document.createElement("button");
    durumButonu.type = "button";
    durumButonu.textContent =
      izlendi ? "İzlenmedi yap" : "İzlendi yap";

    durumButonu.addEventListener("click", () => {
      durumDegistir(id);
    });

    const silButonu = document.createElement("button");
    silButonu.type = "button";
    silButonu.textContent = "Sil";
    silButonu.className = "sil";

    silButonu.addEventListener("click", () => {
      filmSil(id);
    });

    islemler.append(durumButonu, silButonu);
    satir.append(bilgi, islemler);
    filmListesi.appendChild(satir);
  });
};

// Formdaki bilgilerle yeni film oluşturur.
const filmEkle = (event) => {
  event.preventDefault();

  const ad = filmAdiInput.value.trim();
  const tur = filmTuruInput.value.trim();

  if (ad === "" || tur === "") {
    mesaj.textContent = "Film adı ve türü boş bırakılamaz.";
    return;
  }

  const yeniFilm = {
    id: crypto.randomUUID(),
    ad,
    tur,
    izlendi: false
  };

  filmler = [...filmler, yeniFilm];

  if (filmleriKaydet()) {
    mesaj.textContent = `${ad} listeye eklendi.`;
  }

  // Eklenen filmin görünmesi için aramayı temizler.
  filmAramaInput.value = "";

  filmleriGoster();
  filmFormu.reset();
  filmAdiInput.focus();
};

filmFormu.addEventListener("submit", filmEkle);
filmAramaInput.addEventListener("input", filmleriGoster);

filmleriGoster();