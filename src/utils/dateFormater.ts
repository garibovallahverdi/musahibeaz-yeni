function formatLocalizedDate(dateInput: Date | string | undefined) {
    if (!dateInput) {
        throw new Error("Invalid date input");
    }
    const date = new Date(dateInput); // Tarixi Date obyektinə çevir
    const now = new Date(); // İndiki zaman
  
    // Azərbaycan dilində günlərin və ayların adları
    // const days = [
    //   "bazar günü", "bazar ertəsi", "çərşənbə axşamı", 
    //   "çərşənbə", "cümə axşamı", "cümə", "şənbə"
    // ];
    const months = [
      "Yan.",
      "Fev.",
      "Mar.",
      "Apr.",
      "May.",
      "İyn.",
      "İyl.",
      "Avq.",
      "Sen.",
      "Okt.",
      "Noy.",
      "Dek."
    ];
    // Tarix məlumatlarını əldə et
    // const dayName = days[date.getDay()]; // Gün adı
    const day = date.getDate(); // Ayın günü
    const monthName = months[date.getMonth()]; // Ay adı
    const year = date.getFullYear(); // İl
    const hours = String(date.getHours()).padStart(2, "0"); // Saat
    const minutes = String(date.getMinutes()).padStart(2, "0"); // Dəqiqə
  
    // Tarixin bu gün olub-olmadığını yoxla
    const isToday = date.toDateString() === now.toDateString();
  
    // Əgər bu gündürsə "Bu gün 13:15", yoxsa tam tarix formatı
    return isToday 
      ? `Bu gün ${hours}:${minutes}` 
      : `${day} ${monthName} ${year}, ${hours}:${minutes}`;
  }

  
  



  function toDay(dateInput:string) {
    const date = new Date(dateInput); // Tarixi Date obyektinə çevir
  
    // Azərbaycan dilində günlərin və ayların adları
    const days = [
      "bazar günü", "bazar ertəsi", "çərşənbə axşamı", 
      "çərşənbə", "cümə axşamı", "cümə", "şənbə"
    ];
    const months = [
      "yanvar", "fevral", "mart", "aprel", "may", "iyun", 
      "iyul", "avqust", "sentyabr", "oktyabr", "noyabr", "dekabr"
    ];
  
    // Tarix məlumatlarını əldə et
    const dayName = days[date.getDay()]; // Gün adı
    const day = date.getDate(); // Ayın günü
    const monthName = months[date.getMonth()]; // Ay adı
    const year = date.getFullYear(); // İl
    const hours = String(date.getHours()).padStart(2, "0"); // Saat
    const minutes = String(date.getMinutes()).padStart(2, "0"); // Dəqiqə
  
    // Tarixin bu gün olub-olmadığını yoxla
  
    // Əgər bu gündürsə "Bu gün 13:15", yoxsa tam tarix formatı
    return  `${day} ${monthName} ${year}, ${dayName} ${hours}:${minutes}`;
  }

  
  export  {toDay,formatLocalizedDate}