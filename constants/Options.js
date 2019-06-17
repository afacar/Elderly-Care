
const MEASUREMENT_TYPES = {
  TR: ["Şeker", "Tansiyon", "Ruh Hali", "Kilo"],
  EN: ['glucose', 'bp', 'mood', 'weight'],
} 

const MONTHS = {
  TR: ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'],
  EN: ['Ocak', 'Ocak', 'Ocak',  'Ocak',  'Ocak',  'Ocak',  'Ocak',  'Ocak',  'Ocak',  'Ocak',  'Ocak',  'Ocak', ],
}

const MEASUREMENT_TYPES_PLACEHOLDERS = ["Şeker ile ilgili", "Tansiyon ile ...", "Ruh hali...", "Ağırlık..."];

const HUNGER_CONDITION = ["Aç", "Tok"];

const REMINDER_TYPES = {
  TR: ["Ev İşleri", "İlaç", "Randevu", "Diğer..."],
  EN: ["house", "medication", "appointment", "other"],
} 

const REMINDER_TYPES_PLACEHOLDERS = ["Alışveriş, Fatura vb.", "Örneğin, Donepezil 50 mg.", "Dr. Mehmet ile randevu...", "Başlık..."];

const REPEAT_TYPES = {
  TR: ["Yok", "Bir defa", "Her gün", "Her hafta"],
  EN: ["", "once", "day", "week"],
} 

const MOODS = ["😕", "😐", "😃"];

export {
  MEASUREMENT_TYPES,
  MONTHS,
  MEASUREMENT_TYPES_PLACEHOLDERS,
  HUNGER_CONDITION,
  REMINDER_TYPES,
  REMINDER_TYPES_PLACEHOLDERS,
  REPEAT_TYPES,
  MOODS,
};