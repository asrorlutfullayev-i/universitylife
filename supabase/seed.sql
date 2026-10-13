-- UniverLife Demo Seed Data
-- Nisbiy sanalar bilan INSERT qilingan ma'lumotlar (hech qanday DROP/DELETE/TRUNCATE yo'q)

-- 1. STIPENDIYALAR VA XALQARO DASTURLAR (OPPORTUNITIES)
INSERT INTO public.opportunities (title, description, type, deadline, requirements, contact, is_published)
VALUES
(
  'Ibn Sino nomidagi davlat stipendiyasi',
  'Tibbiyot va tabiiy fanlar yo''nalishidagi iqtidorli talabalar uchun beriladigan maxsus davlat stipendiyasi tanlovi.',
  'scholarship',
  current_date + interval '14 days',
  'A''lo baholar (GPA > 4.5), kamida 2 ta ilmiy maqola, kafedra mudiri tavsiyanomasi.',
  'Mas''ul: dotsent R. Qodirov, Telegram: @ibnsino_tanlov',
  true
),
(
  'Mirzo Ulug''bek vorislari jamg''armasi granti',
  'Aniq fanlar, IT va muhandislik yo''nalishidagi innovatsion g''oyalar va startap loyihalarni qo''llab-quvvatlash dasturi.',
  'scholarship',
  current_date + interval '5 days',
  'Bakalavr 2-4 bosqich yoki magistratura talabalari, loyiha taqdimoti (pitch deck), baholar ko''chirmasi.',
  'Elektron pochta: grant@ulugbekfund.uz, Tel: +998 71 200 45 45',
  true
),
(
  'Erasmus+ Talabalar almashinuv dasturi (Germaniya)',
  'Berlin Texnika Universitetida 1 semestr davomida bepul o''qish va oylik 850 evro miqdoridagi stipendiya imkoniyati.',
  'international',
  current_date + interval '21 days',
  'IELTS 6.5+ yoki B2 sertifikati, motivatsion xat (ingliz tilida), transkript.',
  'Xalqaro aloqalar bo''limi, Bino 1, 304-xona. Email: iro@samdu.uz',
  true
),
(
  'Turkiya Burslari: Yozgi ilmiy-tadqiqot stajirovkasi',
  'Istanbul universitetida 1 oylik amaliyot o''tash, turar joy va aviabiletlar qoplanadi.',
  'international',
  current_date + interval '3 days',
  'Bakalavriat talabalari, turk yoki ingliz tili bilish sertifikati, ilmiy reja.',
  'Telegram kanali: @turkiyaburslari_uzb',
  true
),
(
  'Universitet Rektor stipendiyasi',
  'O''quv va jamoat ishlarida alohida faollik ko''rsatayotgan universitet iqtidorli talabalariga oylik qo''shimcha stipendiya.',
  'scholarship',
  current_date + interval '30 days',
  'Barcha fanlardan semestr baholari a''lo bo''lishi, universitet tadbirlaridagi faol ishtirok.',
  'Iqtidorli talabalar bo''limi, 201-xona',
  true
);

-- 2. TADBIRLAR (EVENTS)
INSERT INTO public.events (title, description, category, location, event_date, points, is_published)
VALUES
(
  'Samarqand IT Hackathon 2026',
  '36 soatlik dasturchilar marafonida sun''iy intellekt va ta''lim texnologiyalari bo''yicha yechimlar yaratiladi. G''oliblarga 50 mln so''m sovrin jamg''armasi!',
  'Texnologiya',
  'Axborot texnologiyalari markazi, Coworking zali',
  current_date + interval '4 days' + interval '10 hours',
  30,
  true
),
(
  'Karyera kuni: Yetakchi kompaniyalar bilan uchrashuv',
  'O''zbekistonning 40+ yirik korxonalari bilan to''g''ridan-to''g''ri suhbat, rezyume topshirish va amaliyot o''tash imkoniyati.',
  'Karyera',
  'Bosh bino, Madaniyat saroyi',
  current_date + interval '7 days' + interval '14 hours',
  15,
  true
),
(
  'Talabalar shaxmat chempionati',
  'Universitet birinchiligi uchun shveysarcha tizimda 7 turdan iborat tezkor shaxmat (rapid) musobaqasi.',
  'Sport',
  'Sport majmuasi, 2-qavat zali',
  current_date + interval '2 days' + interval '15 hours',
  20,
  true
),
(
  'STARTUP PITCH: Yoshlar innovatsion loyihalari',
  'Universitet inkubatsiya markazi rezidentlari o''z loyihalarini investorlar va professor-o''qituvchilar oldida himoya qiladi.',
  'Innovatsiya',
  'Texnopark, Katta konferens zal',
  current_date + interval '12 days' + interval '11 hours',
  25,
  true
),
(
  'Kitobxonlik haftaligi va mualliflar bilan muloqot',
  'Yangi zamonaviy asarlar taqdimoti, kitob yarmarkasi va yozuvchilar bilan jonli uchrashuv.',
  'Madaniyat',
  'Axborot-resurs markazi (Kutubxona)',
  current_date + interval '9 days' + interval '16 hours',
  10,
  true
);

-- 3. TO'GARAKLAR (GROUPS: sport | science)
INSERT INTO public.groups (name, description, type, schedule, leader_name, contact, is_published)
VALUES
(
  'AI & Data Science Lab',
  'Sun''iy intellekt, mashinaviy o''rganish va ma''lumotlar tahlili bo''yicha ilmiy va amaliy loyihalar ustida ishlovchi to''garak.',
  'science',
  'Seshanba, Payshanba 16:00',
  'Azizbek Toirov',
  '@ai_lab_samdu',
  true
),
(
  'Universitet Futbol Terma Jamoasi',
  'Talabalar ligasi va viloyat musobaqalariga muntazam tayyorgarlik mashg''ulotlari va seleksiya.',
  'sport',
  'Dushanba, Chorshanba, Juma 17:30',
  'Murabbiy: Alisher Yo''ldoshev',
  '+998 90 123 45 67',
  true
),
(
  'Kiberxavfsizlik va Algoritmlar to''garagi',
  'CTF musobaqalari, xavfsizlik protokollari va murakkab dasturlash algoritmlarini chuqurlashtirilgan o''rganish.',
  'science',
  'Chorshanba, Shanba 15:00',
  'Sardor Karimov',
  '@cyber_samdu',
  true
),
(
  'Stol tennisi klubi',
  'Havaskor va professional talabalar uchun sport mashg''ulotlari, o''rtoqlik o''yinlari va mini-turnirlar.',
  'sport',
  'Har kuni 18:00 - 20:00',
  'Bekzod Oripov',
  '@table_tennis_samdu',
  true
);

-- 4. YANGILIKLAR (NEWS)
INSERT INTO public.news (title, content, image_url, is_published)
VALUES
(
  'Universitetimizda yangi Coworking va Startap laboratoriyasi ochildi',
  'Talabalarning erkin ijod qilishlari, loyihalar ustida ishlashlari va jamoa to''plashlari uchun zamonaviy texnik uskunalar bilan jihozlangan 24/7 rejimida ishlovchi yangi Coworking markazi foydalanishga topshirildi. Markazda yuqori tezlikdagi internet, 3D printerlar va taqdimot xonalari mavjud.',
  'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80',
  true
),
(
  'Talabalarimiz xalqaro ICPC dasturlash musobaqasi yarim finaliga yo''llanma oldi',
  'Universitetimizning 3 ta talabadan iborat "Registon Devs" jamoasi Olmaota shahrida bo''lib o''tgan mintaqaviy bosqichda faxrli 2-o''rinni egallab, Markaziy Osiyo nomidan yarim finalga yo''l oldi. Jamoa a''zolariga universitet rahbariyati tomonidan esdalik sovg''alari topshirildi.',
  'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=800&q=80',
  true
),
(
  'Yangi o''quv semestrida kutubxona fondiga 500 dan ortiq xorijiy darsliklar keltirildi',
  'Axborot-resurs markazi fondi MIT, Oksford va Kembrij nashriyotlarining so''nggi IT, tibbiyot, iqtisodiyot va tabiiy fanlar bo''yicha original ingliz tilidagi kitoblari bilan boyitildi. Barcha kitoblar elektron katalogga kiritildi va talabalar uchun ochiq.',
  'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=800&q=80',
  true
);
