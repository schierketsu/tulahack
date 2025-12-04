import { SocialObject } from "../types";

// Данные приведены в соответствие с файлом db.md в корне проекта.
// Для каждого объекта заполняем флаги доступности по строкам:
// «для людей с ... - ДА/НЕТ».

export const socialObjects: SocialObject[] = [
  /**
   * Здравоохранение
   */
  {
    id: "guz-tosp-morozova-2a",
    name: "ГУЗ Тульская областная стоматологическая поликлиника (отделение)",
    category: "healthcare",
    description: "Стоматологическая поликлиника.",
    address: "Центральный район, город Тула, улица Морозова, 2, А",
    coordinates: [54.183186, 37.631002],
    accessibilityNotes: [],
    accessibility: {
      vision: false,
      hearing: false,
      wheelchair: false,
      mobility: false,
      mental: false
    }
  },
  {
    id: "guz-tob2tolstogo-filial1-demianova-22",
    name: "ГУЗ Тульская областная клиническая больница №2 им. Л. Н. Толстого Филиал № 1 Поликлиника",
    category: "healthcare",
    description: "Поликлиника областной клинической больницы №2.",
    address: "Центральный район, город Тула, улица Демьянова, 22",
    coordinates: [54.172262, 37.621121],
    accessibilityNotes: [],
    accessibility: {
      vision: false,
      hearing: false,
      wheelchair: false,
      mobility: false,
      mental: false
    }
  },
  {
    id: "gb12-tula-poliklinika-2-pervomaiskaya-11",
    name: "ГУЗ Городская больница № 12 г. Тулы Поликлиника № 2",
    category: "healthcare",
    description: "Городская больница № 12, поликлиника № 2.",
    address: "Советский район, город Тула, улица Первомайская, 11",
    coordinates: [54.182259, 37.600424],
    accessibilityNotes: [],
    accessibility: {
      vision: true,
      hearing: true,
      wheelchair: true,
      mobility: false,
      mental: false
    }
  },
  {
    id: "guz-tosp-tokareva-70a",
    name: "ГУЗ Тульская областная стоматологическая поликлиника",
    category: "healthcare",
    description: "Тульская областная стоматологическая поликлиника.",
    address: "район Заречье, город Тула, улица Токарева, 70, А",
    coordinates: [54.224696, 37.619288],
    accessibilityNotes: [],
    accessibility: {
      vision: true,
      hearing: true,
      wheelchair: true,
      mobility: true,
      mental: false
    }
  },
  {
    id: "toptd1-filial1-sverdlova-18",
    name: "ГУЗ Тульский областной противотуберкулёзный диспансер № 1 Филиал № 1 Поликлиника",
    category: "healthcare",
    description: "Областной противотуберкулёзный диспансер № 1, филиал № 1.",
    address: "Новомосковский район, город Новомосковск, улица Свердлова, 18",
    coordinates: [54.008898, 38.301199],
    accessibilityNotes: [],
    accessibility: {
      vision: false,
      hearing: false,
      wheelchair: false,
      mobility: false,
      mental: false
    }
  },
  {
    id: "guz-donskaya-gb1-poliklinika-michurina-1a",
    name: "ГУЗ Донская городская больница № 1 Поликлиника",
    category: "healthcare",
    description: "Донская городская больница № 1, поликлиника.",
    address: "микрорайон Северо-Задонск, город Донской, улица Мичурина, 1, А",
    coordinates: [54.025049, 38.382775],
    accessibilityNotes: [],
    accessibility: {
      vision: true,
      hearing: true,
      wheelchair: true,
      mobility: true,
      mental: false
    }
  },
  {
    id: "guz-aleksin-rb1-poliklinika-2-centralnaya-13a",
    name: "ГУЗ Алексинская районная больница №1 им. проф. В. Ф. Снегирева Поликлиника № 2",
    category: "healthcare",
    description: "Алексинская районная больница №1, поликлиника № 2.",
    address: "Алексинский район, город Алексин, улица Центральная, 13, а",
    coordinates: [54.025049, 38.382775],
    accessibilityNotes: [],
    accessibility: {
      vision: true,
      hearing: true,
      wheelchair: true,
      mobility: false,
      mental: false
    }
  },

  /**
   * Социальная защита населения
   */
  {
    id: "guto-razvitie-epifanskaya-189",
    name: "Государственное учреждение Тульской области Региональный центр Развитие",
    category: "social",
    description: "Региональный центр социальной поддержки «Развитие».",
    address: "Пролетарский, Тула, Епифанская, 189",
    coordinates: [54.193823, 37.653047],
    accessibilityNotes: [],
    accessibility: {
      vision: true,
      hearing: true,
      wheelchair: true,
      mobility: true,
      mental: true
    }
  },
  {
    id: "kompleksny-centr-so-n1-ageeva-20a",
    name: "Государственное учреждение Тульской области «Комплексный центр социального обслуживания населения №1»",
    category: "social",
    description: "Комплексный центр социального обслуживания населения №1.",
    address: "Тула, Агеева, 20, А",
    coordinates: [54.169906, 37.607502],
    accessibilityNotes: [],
    accessibility: {
      vision: false,
      hearing: false,
      wheelchair: false,
      mobility: false,
      mental: false
    }
  },
  {
    id: "territorialny-otdel-bogoroditsk-proletarskaya-41",
    name: "Территориальный отдел по Богородицкому району Министерства труда и социальной защиты Тульской области",
    category: "social",
    description: "Территориальный отдел Министерства труда и социальной защиты.",
    address: "Тульская область, г.Богородицк, ул.Пролетарская, д.41",
    coordinates: [53.772615, 38.134256],
    accessibilityNotes: [],
    accessibility: {
      vision: false,
      hearing: false,
      wheelchair: false,
      mobility: false,
      mental: true
    }
  },
  {
    id: "cso-n1-donskoy-ploshad-sovetskaya-1",
    name: "Государственное учреждение Тульской области Центр социального обслуживания населения №1",
    category: "social",
    description: "Центр социального обслуживания населения №1.",
    address: "г. Донской, мкр. Центральный, Площадь Советская, 1",
    coordinates: [54.025049, 38.382775],
    accessibilityNotes: [],
    accessibility: {
      vision: true,
      hearing: true,
      wheelchair: true,
      mobility: true,
      mental: true
    }
  },

  /**
   * Культура
   */
  {
    id: "biblioteka-filial-15-m-zhukova-8b",
    name: "Библиотека-филиал №15 МУК «Тульская библиотечная система»",
    category: "culture",
    description: "Библиотека-филиал №15 МУК «Тульская библиотечная система».",
    address: "г.Тула, ул.М.Жукова, д.8-б",
    coordinates: [54.0, 37.0], // координаты в db.md не указаны
    accessibilityNotes: [],
    accessibility: {
      vision: false,
      hearing: true,
      wheelchair: true,
      mobility: true,
      mental: true
    }
  },
  {
    id: "modelnaya-biblioteka-1-novomoskovskaya-9",
    name: "Модельная библиотека №1 МУК «Тульская библиотечная система»",
    category: "culture",
    description: "Модельная библиотека №1 МУК «Тульская библиотечная система».",
    address: "г.Тула, ул.Новомосковская, д.9",
    coordinates: [54.176873, 37.641297],
    accessibilityNotes: [],
    accessibility: {
      vision: false,
      hearing: true,
      wheelchair: true,
      mobility: true,
      mental: true
    }
  },
  {
    id: "centr-tvorchestva-skurotovskiy-shakhterskaya-49a",
    name: "ОП Центр творчества Скуратовский МАУК КДС",
    category: "culture",
    description: "Центр творчества Скуратовский МАУК КДС.",
    address: "Тула, поселок Южный, улица Шахтерская, 49, А",
    coordinates: [54.096593, 37.610071],
    accessibilityNotes: [],
    accessibility: {
      vision: false,
      hearing: false,
      wheelchair: true,
      mobility: true,
      mental: true
    }
  },
  {
    id: "revjakinskiy-centr-kultury-sovetskaya-12",
    name: "Муниципальное казенное учреждение 'Ревякинский центр культуры, досуга и библиотечного обслуживания'",
    category: "culture",
    description:
      "Муниципальное казенное учреждение «Ревякинский центр культуры, досуга и библиотечного обслуживания».",
    address:
      "301056, Тульская область, Ясногорский район, поселок Ревякино, ул. Советская, д.12",
    coordinates: [54.366843, 37.659344],
    accessibilityNotes: [],
    accessibility: {
      vision: false,
      hearing: false,
      wheelchair: false,
      mobility: false,
      mental: false
    }
  }
];


