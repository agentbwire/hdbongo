/**
 * HD MOVIEZ CLUB - Content Data
 * 
 * IMPORTANT: For FREE hosting, use embedded links instead of storing videos!
 * 
 * Embed sources (FREE & unlimited):
 * - VidSrc: https://vidfast.vc/embed/movie/{tmdb_id}
 * - 2embed: https://www.2embed.cc/embed/{imdb_id}
 * - SuperEmbed: https://multiembed.mov/?video_id={imdb_id}
 * - Embedsu: https://embed.su/embed/movie/{tmdb_id}
 * 
 * For XXX content:
 * - Use embed codes from legal adult sites
 */

// EDIT THIS FILE ONLY to add or update titles. The app reads every card,
// stream, trailer, download option, subtitle, and episode from this array.
// Keep one object per title and leave optional fields as empty strings/arrays.
// Required: id, title, category, image, description, year, embedUrl.
// Optional: trailerUrl, rating, reviews, points, duration, subtitles, downloadLinks.
const CONTENT = [
  // ACTION -  Movies
  {
    id: "1",
    title: "Pisi Kali za first year zikidinyana Hosteli",
    category: "Warembo",
    rating: 4.9,
    reviews: 2450,
    points: 0,
    image: "https://ik.imagekit.io/xpgowgcjw/Pisi%20Kali%20za%20first%20year%20zikidinyana%20Hosteli.png?updatedAt=1790333536906",
    trailerUrl: "https://www.youtube.com/embed/soy2zOo69AE",
    // FREE embedded streaming link (use TMDB/IMDB IDs)
    embedUrl: "https://vidfast.vc/embed/movie/155", // The Bluff TMDB ID
    // External download links - use FREE file hosts!
    downloadLinks: [
      { quality: "1080p", size: "387MB", url: "https://pixeldrain.com/u/example1", host: "Download" },
    ],
    description: "Pale CBE Mwanza Wanatombana ao ni noma.",
    duration: "2h 32min",
    year: 2026,
    // Subtitles support
    subtitles: [
      { lang: "en", label: "English", url: "" },
      { lang: "sw", label: "Kiswahili", url: "" }
    ]
  },
  {
    id: "2",
    title: "Mbolo ya Baba mkwe tamu sana",
    category: "Warembo",
    rating: 4.7,
    reviews: 1950,
    points: 50,
    image: "https://ik.imagekit.io/xpgowgcjw/Mbolo%20ya%20Baba%20mkwe%20tamu%20sana.png?updatedAt=1790333753342",
    trailerUrl: "https://player.mux.com/Z9K7Mgf00sqqi2jWX2EupiaVt2yhwAcqtbETZKnoisCU",
    embedUrl: "https://vidfast.vc/embed/movie/27205", // Inception
    downloadLinks: [
        { quality: "720p", size: "213MB", url: "https://pixeldrain.com/u/example2", host: "Download" },
    ],
    description: "",
    duration: "2h 15min",
    year: 2026,
    subtitles: [
      { lang: "en", label: "English", url: "" },
      { lang: "sw", label: "Kiswahili", url: "" }
    ]
  },
  {
    id: "3",
    title: "Warembo Wa  Chuo UDOM wakitigishwa mikundu",
    category: "Warembo",
    rating: 4.7,
    reviews: 1950,
    points: 50,
    image: "https://ik.imagekit.io/xpgowgcjw/Warembo%20Wa%20%20Chuo%20UDOM%20wakitigishwa%20mikundu.png?updatedAt=1790333674646",
    trailerUrl: "https://www.youtube.com/embed/YRXmuv56CdI",
    embedUrl: "https://vidfast.vc/embed/movie/27205", // Inception
    downloadLinks: [
        { quality: "720p", size: "215MB", url: "https://pixeldrain.com/u/example2", host: "Download" },
    ],
    description: "",
    duration: "2h 15min",
    year: 2026,
    subtitles: [
      { lang: "en", label: "English", url: "" },
      { lang: "sw", label: "Kiswahili", url: "" }
    ]
  },
  {
    id: "4",
    title: "Visimi vyatuwasha tunataka kutobwa jamani",
    category: "Warembo",
    rating: 4.7,
    reviews: 1950,
    points: 50,
    image: "https://ik.imagekit.io/xpgowgcjw/Visimi%20vyatuwasha%20tunataka%20kutobwa%20jamani.png?updatedAt=1790334195156",
    trailerUrl: "https://www.youtube.com/embed/YRXmuv56CdI",
    embedUrl: "https://vidfast.vc/embed/movie/27205", // Inception
    downloadLinks: [
        { quality: "720p", size: "115MB", url: "https://pixeldrain.com/u/example2", host: "Download" },
    ],
    description: "",
    duration: "2h 15min",
    year: 2026,
    subtitles: [
      { lang: "en", label: "English", url: "" },
      { lang: "sw", label: "Kiswahili", url: "" }
    ]
  },
   {
    id: "5",
    title: "Nilimzamisha Shemeji Hadi Akakojoa",
    category: "Warembo",
    rating: 4.7,
    reviews: 1950,
    points: 50,
    image: "https://ik.imagekit.io/xpgowgcjw/Nilimzamisha%20Shemeji%20Hadi%20Akakojoa.png",
    trailerUrl: "https://player.mux.com/IQzV5eYCDW2P50100sJJRoG1h7XiD3Avzwj6lwi7ISbaA",
    embedUrl: "https://vidfast.vc/embed/movie/27205", // Inception
    downloadLinks: [
        { quality: "720p", size: "915MB", url: "https://pixeldrain.com/u/example2", host: "Download" },
    ],
    description: "Genge la wezi wa hali ya juu wakiongozwa na The Shadow- mzee mwenye akili nyingi. Wanaiba mabilioni kwa kuhack mifumo ya usalama.",
    duration: "2h 15min",
    year: 2024,
    subtitles: [
      { lang: "en", label: "English", url: "" },
      { lang: "sw", label: "Kiswahili", url: "" }
    ]
  },

  // HORROR - Movies
  {
    id: "6",
    title: "Nlitokwa Ute kwa DUDU la Mjomba",
    category: "Bila huruma",
    rating: 4.6,
    reviews: 1820,
    points: 50,
    image: "https://ik.imagekit.io/xpgowgcjw/Nlitokwa%20Ute%20kwa%20DUDU%20la%20Mjomba.png",
    trailerUrl: "https://www.youtube.com/embed/kgv8jf_8dm0?autoplay=1",
    embedUrl: "https://vidfast.vc/embed/movie/920",
    downloadLinks: [
      { quality: "720p", size: "281MB", url: "#download-480p", host: "Server 1" },
    ],
    description: "kwenda mapumziko kutalii.",
    duration: "1h 58min",
    year: 2025,
    subtitles: [
      { lang: "en", label: "English", url: "" }
    ]
  },
  {
    id: "7",
    title: "Mrembo wa DIT Alambiswa Uboo ili Afaulu",
    category: "Warembo",
    rating: 4.4,
    reviews: 1200,
    points: 50,
    image: "https://ik.imagekit.io/xpgowgcjw/Mrembo%20wa%20DIT%20Alambiswa%20Uboo%20ili%20Afaulu.png",
    trailerUrl: "https://player.mux.com/pssbKP8lXssSLNFhFWZsKiPkhpV5fYCCMc4jaFjT7UE",
    embedUrl: "https://vidfast.vc/embed/movie/614479",
    downloadLinks: [
      { quality: "720p", size: "184MB", url: "#download-720p", host: "Download" },
    ],
    description: " huyo katili.",
    duration: "1h 52min",
    year: 2026,
    subtitles: []
  },
  {
    id: "8",
    title: "Mjomba alinipanua KUMA yangu ndogo",
    category: "Warembo",
    rating: 4.4,
    reviews: 1200,
    points: 50,
    image: "https://ik.imagekit.io/xpgowgcjw/Mjomba%20alinipanua%20KUMA%20yangu%20ndogo.png",
    trailerUrl: "https://player.mux.com/S6PV02aO9ofFH1qN2IpFjZEODMN01ATPNRtoV6c9n4VpU",
    embedUrl: "https://vidfast.vc/embed/movie/614479",
    downloadLinks: [
      { quality: "720p", size: "84MB", url: "#download-720p", host: "Download" },
    ],
    description: "",
    duration: "1h 52min",
    year: 2026,
    subtitles: []
  },
   {
    id: "9",
    title: "Mlinzi alinisugua Kuma hadi nkahisi Utamu",
    category: "Warembo",
    rating: 4.4,
    reviews: 1200,
    points: 50,
    image: "https://ik.imagekit.io/xpgowgcjw/Mlinzi%20alinisugua%20Kuma%20hadi%20nkahisi%20Utamu.png",
    trailerUrl: "https://player.mux.com/Ta7xqs7EXb7ysWKCqoa3JDiUq5o9R9CR3E2DpNOdkO00",
    embedUrl: "https://vidfast.vc/embed/movie/614479",
    downloadLinks: [
      { quality: "720p", size: "584MB", url: "#download-720p", host: "Download" },
    ],
    description: "",
    duration: "1h 52min",
    year: 2024,
    subtitles: []
  },
   {
    id: "10",
    title: "Mlinzi alinisugua Kuma hadi nkahisi Utamu 2",
    category: "Warembo",
    rating: 4.4,
    reviews: 1200,
    points: 50,
    image: "https://ik.imagekit.io/xpgowgcjw/Mlinzi%20alinisugua%20Kuma%20hadi%20nkahisi%20Utamu%202.png",
    trailerUrl: "https://player.mux.com/KKkly1bdEsmdUxTnno6Gu5zFL900RHlfLj0101kj01KchpE",
    embedUrl: "https://vidfast.vc/embed/movie/614479",
    downloadLinks: [
      { quality: "720p", size: "584MB", url: "#download-720p", host: "Download" },
    ],
    description: "",
    duration: "1h 52min",
    year: 2024,
    subtitles: []
  },


  // ROMANCE - Movies
  {
    id: "11",
    title: "Violet",
    category: "Tomba kabisa",
    rating: 4.7,
    reviews: 3200,
    points: 50,
    image: "https://res.cloudinary.com/dqlgbcalk/image/upload/v1778512691/violet_cqfzsm.jpg",
    trailerUrl: "https://www.youtube.com/embed/mvRifNrn-oo",
    embedUrl: "https://vidfast.vc/embed/movie/70",
    downloadLinks: [
      { quality: "480p", size: "258MB", url: "#download-480p", host: "Download" },
    ],
    description: "Violet Binti wa mchungaji, msichana alieharibika kitabia baada ya kuhudhuria tamasha la Panagbenga na Kufundishwa tabia Mbaya.",
    duration: "2h 05min",
    year: 2024,
    subtitles: [
      { lang: "en", label: "English", url: "" }
    ]
  },
  {
    id: "12",
    title: "Ligaw",
    category: "Tomba kabisa",
    rating: 4.6,
    reviews: 2800,
    points: 50,
    image: "https://res.cloudinary.com/dqlgbcalk/image/upload/v1778512904/Ligaw_c43fv0.jpg",
    trailerUrl: "https://www.youtube.com/embed/Czv6Qms1O4Q",
    embedUrl: "https://vidfast.vc/embed/movie/509967",
    downloadLinks: [
      { quality: "480p", size: "364MB", url: "#download-480p", host: "Download" },
    ],
    description: "Dolores,mke wa mlemavu aliejaa Upwiru. Maisha yake ya ngono yanabadilika mpanda mlima kijana anapofika kijijini.",
    duration: "1h 48min",
    year: 2024,
    subtitles: []
  },
  {
    id: "13",
    title: "The Escort Wife",
    category: "Tomba kabisa",
    rating: 4.4,
    reviews: 2400,
    points: 50,
    image: "https://res.cloudinary.com/dqlgbcalk/image/upload/v1778513673/Escort_pjqdoo.jpg",
    trailerUrl: "https://www.youtube.com/embed/ZK_RDPj0bE0",
    embedUrl: "https://vidfast.vc/embed/movie/4951",
    downloadLinks: [
      { quality: "480p", size: "360MB", url: "#download-480p", host: "Server 1" },
      { quality: "720p", size: "780MB", url: "#download-720p", host: "Server 2" },
      { quality: "1080p", size: "1.9GB", url: "#download-1080p", host: "Server 3" }
    ],
    description: "Inamhusu Patricia, mke anayekuwa malaya kulipiza kisasi baada ya kugundua mumewe anamcheat.",
    duration: "1h 50min",
    year: 2024,
    subtitles: []
  },

  // ANIMATION - Movies
  {
    id: "16",
    title: "Malaya wenye Nyege",
    category: "Baikoko",
    rating: 4.8,
    reviews: 4500,
    points: 50,
    image: "https://ik.imagekit.io/xpgowgcjw/WJ4cy.jpg",
    trailerUrl: "https://www.youtube.com/embed/glgmAwRDP8s",
    embedUrl: "https://vidfast.vc/embed/movie/10191",
    downloadLinks: [
      { quality: "480p", size: "445MB", url: "#download-480p", host: "Download" },
    ],
    description: "Kama we malaya unataka kutobwa mcheki uyu mtombaji katili mwanza whatsapp 0675488844 akutombe vizuri.",
    duration: "1h 45min",
    year: 2025,
    subtitles: [
      { lang: "en", label: "English", url: "" }
    ]
  },
  {
    id: "17",
    title: "Baikoko Matako",
    category: "Baikoko",
    rating: 4.9,
    reviews: 5200,
    points: 50,
    image: "https://ik.imagekit.io/xpgowgcjw/Baikoko%20Matako.png",
    trailerUrl: "https://www.youtube.com/embed/3JTVQTk36R8",
    embedUrl: "https://vidfast.vc/embed/movie/38757",
    downloadLinks: [
      { quality: "480p", size: "367MB", url: "#download-480p", host: "Download" },
    ],
    description: "",
    duration: "1h 40min",
    year: 2026,
    subtitles: []
  },
   {
    id: "18",
    title: "Mke wa Jirani Aliniomba Nimtombe mumewe akiwa kazini",
    category: "Baikoko",
    rating: 4.9,
    reviews: 5200,
    points: 50,
    image: "https://ik.imagekit.io/xpgowgcjw/Mke%20wa%20Jirani%20Aliniomba%20Nimtombe%20mumewe%20akiwa%20kazini.png",
    trailerUrl: "https://www.youtube.com/embed/3JTVQTk36R8",
    embedUrl: "https://vidfast.vc/embed/movie/38757",
    downloadLinks: [
      { quality: "480p", size: "367MB", url: "#download-480p", host: "Download" },
    ],
    description: ".",
    duration: "1h 40min",
    year: 2024,
    subtitles: []
  },
  {
    id: "19",
    title: "Malaya akienjoy kutobwa na BOLO nene jeusi",
    category: "Baikoko",
    rating: 4.9,
    reviews: 5200,
    points: 50,
    image: "https://ik.imagekit.io/xpgowgcjw/Malaya%20akienjoy%20kutobwa%20na%20BOLO%20nene%20jeusi.png",
    trailerUrl: "https://www.youtube.com/embed/3JTVQTk36R8",
    embedUrl: "https://vidfast.vc/embed/movie/38757",
    downloadLinks: [
      { quality: "480p", size: "167MB", url: "#download-480p", host: "Download" },
    ],
    description: ".",
    duration: "1h 40min",
    year: 2026,
    subtitles: []
  },
   {
    id: "20",
    title: "Laana Tupu Baikoko",
    category: "Baikoko",
    rating: 4.9,
    reviews: 5200,
    points: 50,
    image: "https://ik.imagekit.io/xpgowgcjw/Laana%20Tupu%20Baikoko.png",
    trailerUrl: "https://www.youtube.com/embed/3JTVQTk36R8",
    embedUrl: "https://vidfast.vc/embed/movie/38757",
    downloadLinks: [
      { quality: "480p", size: "367MB", url: "#download-480p", host: "Download" },
    ],
    description: ".",
    duration: "1h 40min",
    year: 2026,
    subtitles: []
  },

  // XXX (Adult Content - 18+) - Movies 
  {
    id: "21",
    title: "Tayuan",
    category: "Vivamax",
    rating: 4.8,
    reviews: 2800,
    points: 100,
    image: "https://ik.imagekit.io/xpgowgcjw/Tayuan.png",
    trailerUrl: "https://www.youtube.com/embed/n-iJKLQZHvg?si=aozTtLlb02flB-tM", // Placeholder trailer
    embedUrl: "https://vidfast.vc/embed/movie/10020", // VidFast live embed
    downloadLinks: [
      { quality: "480p", size: "295MB", url: "https://example.com/dl1", host: "Download" },
    ],
    description: "Eva abiria  mwenye upwiru ajikuta akizama penzini na kondakta.",
    duration: "1h 35min",
    year: 2024,
    subtitles: [
      { lang: "en", label: "English", url: "" }
    ],
    isAdult: true
  },
  {
    id: "22",
    title: "Room Service",
    category: "Vivamax",
    rating: 4.7,
    reviews: 2200,
    points: 100,
    image: "https://res.cloudinary.com/dqlgbcalk/image/upload/v1777975283/MV5BNjVhYTMyNDQtNTc0Ny00MjU4LTgzOWItYjhmNWQxMDcyZGJmXkEyXkFqcGc._V1__ziytaj.jpg",
    trailerUrl: "https://www.youtube.com/embed/uxznjj5eqnY", // Placeholder trailer
    embedUrl: "https://vidfast.vc/embed/movie/10020", // Unfaithful
    downloadLinks: [
      { quality: "480p", size: "192MB", url: "https://example.com/dl1", host: "Download" },
    ],
    description: "Mhudumu wa hoteli mwenye tamaa kali ya ngono anayeitwa Carol. Anavutiwa na mgeni malaya anayeleta wanawake tofauti chumbani kila siku na kuwavua chupi.Carol anaanza kuota kuwa mmoja wao.",
    duration: "1h 30min",
    year: 2024,
    subtitles: [],
    isAdult: true
  },
  {
    id: "23",
      title: "Elevator Lady",
    category: "Vivamax",
    rating: 4.9,
    reviews: 3100,
    points: 100,
    image: "https://ik.imagekit.io/xpgowgcjw/Elevator%20lady.png",
    trailerUrl: "https://www.youtube.com/embed/EpWuXVDx8Zo?si=r8AdCbf_dh2jBdpy", // Placeholder trailer
    embedUrl: "https://vidfast.vc/embed/movie/9619", // Original Sin
    downloadLinks: [
      { quality: "480p", size: "309MB", url: "https://example.com/dl1", host: "Download" },
    ],
    description: "Kat,msichana anayefanya kazi kama opareta wa lifti  anayeuza mwili kwa wapandaji humo ndani ya lifti, halafu akafanya ngono na tajiri aliyeoa hadi akafumaniwa.",
    duration: "1h 50min",
    year: 2024,
    subtitles: [
      { lang: "en", label: "English", url: "" },
      { lang: "sw", label: "Kiswahili", url: "" }
    ],
    isAdult: true
  },
  {
    id: "24",
    title: "Virgin Forest",
    category: "Vivamax",
    rating: 4.6,
    reviews: 1800,
    points: 100,
    image: "https://ik.imagekit.io/xpgowgcjw/virgin%20forest.png",
    trailerUrl: "https://www.youtube.com/embed/8CFbfiQGYNo?si=v2wlRZNzZGozgagQ", // Placeholder trailer
    embedUrl: "https://vidfast.vc/embed/movie/9095", // Basic Instinct
    downloadLinks: [
      { quality: "720p", size: "428MB", url: "https://example.com/dl1", host: "Download" }
    ],
    description: "Francis, mpiga picha anayegundua danguro la siri msituni linalotumiwa na wakataji miti haramu kuwabaka mabikra, nakuamua kuwaokoa wasichana waliotekwa.",
    duration: "1h 25min",
    year: 2024,
    subtitles: [],
    isAdult: true
  },
   {
    id: "25",
    title: "Maalikaya",
    category: "Vivamax",
    rating: 4.7,
    reviews: 2500,
    points: 100,
    image: "https://ik.imagekit.io/xpgowgcjw/Maalikaya.png",
    trailerUrl: "https://www.youtube.com/embed/jabB6QHdh5U?si=7ZeBannWyjI7GxSQ", // Placeholder trailer
    embedUrl: "https://vidfast.vc/embed/movie/508", // Eyes Wide Shut
    downloadLinks: [
      { quality: "480p", size: "282MB", url: "https://example.com/dl1", host: "Download" },
    ],
    description: "Kara, mfungwa wa kike gerezani mwenye tamaa za ngono,aliyegundua wafungwa wanauzwa kimwili kwa wateja wa nje. Kara analazimika kubaka wenzie ili kujikomboa.",
    duration: "1h 40min",
    year: 2024,
    subtitles: [
      { lang: "en", label: "English", url: "" }
    ],
    isAdult: true
  },
   {
    id: "26",
    title: "Teachers Pet",
    category: "Vivamax",
    rating: 4.7,
    reviews: 2200,
    points: 100,
    image: "https://ik.imagekit.io/xpgowgcjw/pet.png",
    trailerUrl: "https://www.youtube.com/embed/M1BzlWVBlCI", // Placeholder trailer
    embedUrl: "https://vidfast.vc/embed/movie/10020", // Unfaithful
    downloadLinks: [
      { quality: "480p", size: "262MB", url: "https://example.com/dl1", host: "Download" },
    ],
    description: "Robin kijana asiena adabu anayetumia mbinu za kingono kumtongoza mwalimu wake wa kike aitwae Tanya hadi kumvua chupi na kuanzisha uhusiano wa siri.",
    duration: "1h 30min",
    year: 2024,
    subtitles: [],
    isAdult: true
  },
   {
    id: "27",
    title: "Kabitan",
    category: "Vivamax",
    rating: 4.7,
    reviews: 2200,
    points: 100,
    image: "https://ik.imagekit.io/xpgowgcjw/kabitan.png",
    trailerUrl: "https://www.youtube.com/embed/RthHGr526Zc", // Placeholder trailer
    embedUrl: "https://vidfast.vc/embed/movie/10020", // Unfaithful
    downloadLinks: [
      { quality: "480p", size: "395MB", url: "https://example.com/dl1", host: "Download" },
    ],
    description: "Michepuko wawili Alice & Mika wote wawili ni wapenzi wa wanaume waliooa, Urafiki wao unakua wa karibu zaidi hadi wanaangukiana kimapenzi - misagano mwanzo mwisho.",
    duration: "1h 30min",
    year: 2024,
    subtitles: [],
    isAdult: true
  },
  {
    id: "28",
    title: "Private Tutor",
    category: "Vivamax",
    rating: 4.6,
    reviews: 1800,
    points: 100,
    image: "https://ik.imagekit.io/xpgowgcjw/Private%20Tutor.png",
    trailerUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ", // Placeholder trailer
    embedUrl: "https://vidfast.vc/embed/movie/9095", // Basic Instinct
    downloadLinks: [
      { quality: "720p", size: "238MB", url: "https://example.com/dl1", host: "Download" }
    ],
    description: "Adult content - 18+ Only. Viewer discretion advised. Maudhui ya watu wazima pekee.",
    duration: "1h 25min",
    year: 2024,
    subtitles: [],
    isAdult: true
  },

  // ============================================
  // SERIES / TV SHOWS WITH SEASONS & EPISODES
  // ============================================

  // ACTION SERIES
 {
    id: "29",
    title: "Napenda Kulamba DUDU la rafiki yangu",
    category: "Warembo",
    rating: 4.8,
    reviews: 2800,
    points: 100,
    image: "https://ik.imagekit.io/xpgowgcjw/Napenda%20Kulamba%20DUDU%20la%20rafiki%20yangu.png",
    trailerUrl: "https://player.mux.com/vYC4101ewPLKapa3sAmvjTegNRwC00qfeCnqJoGGX6tzA", // Placeholder trailer
    embedUrl: "https://vidfast.vc/embed/movie/10020", // VidFast live embed
    downloadLinks: [
      { quality: "480p", size: "295MB", url: "https://example.com/dl1", host: "Download" },
    ],
    description: "mfanyakazitak.",
    duration: "1h 35min",
    year: 2026,
    subtitles: [
      { lang: "en", label: "English", url: "" }
    ],
    isAdult: true
  },
    {
    id: "30",
    title: "Baikoko Maghetoni",
    category: "Baikoko",
    rating: 4.9,
    reviews: 5200,
    points: 50,
    image: "https://ik.imagekit.io/xpgowgcjw/Baikoko%20Maghetoni.png",
    trailerUrl: "https://www.youtube.com/embed/3JTVQTk36R8",
    embedUrl: "https://vidfast.vc/embed/movie/38757",
    downloadLinks: [
      { quality: "480p", size: "367MB", url: "#download-480p", host: "Download" },
    ],
    description: "",
    duration: "1h 40min",
    year: 2024,
    subtitles: []
  },
  {
    id: "31",
    title: "Binamu Aliitomba KUMA yote",
    category: "Baikoko",
    rating: 4.9,
    reviews: 5200,
    points: 50,
    image: "https://ik.imagekit.io/xpgowgcjw/Binamu%20Aliitomba%20KUMA%20yote.png",
    trailerUrl: "https://www.youtube.com/embed/3JTVQTk36R8",
    embedUrl: "https://vidfast.vc/embed/movie/38757",
    downloadLinks: [
      { quality: "480p", size: "367MB", url: "#download-480p", host: "Download" },
    ],
    description: ".",
    duration: "1h 40min",
    year: 2024,
    subtitles: []
  },
   {
    id: "32",
    title: "Laana za watoto wa 2000",
    category: "Baikoko",
    rating: 4.9,
    reviews: 5200,
    points: 50,
    image: "https://ik.imagekit.io/xpgowgcjw/x3LNA.jpg",
    trailerUrl: "https://www.youtube.com/embed/3JTVQTk36R8",
    embedUrl: "https://vidfast.vc/embed/movie/38757",
    downloadLinks: [
      { quality: "480p", size: "367MB", url: "#download-480p", host: "Download" },
    ],
    description: "",
    duration: "1h 40min",
    year: 2024,
    subtitles: []
  },
   {
    id: "33",
    title: "Dada alinifundisha kupanua Mkundu",
    category: "Baikoko",
    rating: 4.9,
    reviews: 5200,
    points: 50,
    image: "https://ik.imagekit.io/xpgowgcjw/Dada%20alinifundisha%20kupanua%20Mkundu.png",
    trailerUrl: "https://www.youtube.com/embed/3JTVQTk36R8",
    embedUrl: "https://vidfast.vc/embed/movie/38757",
    downloadLinks: [
      { quality: "480p", size: "367MB", url: "#download-480p", host: "Download" },
    ],
    description: "<br><b>Tazama Full Video</b></br> Muda : saa 1dk25 Ukubwa: MB367 .",
    duration: "1h 40min",
    year: 2024,
    subtitles: []
  },
  {
    id: "34",
    title: "Mjomba alinifira mpaka Mavi",
    category: "Baikoko",
    rating: 4.9,
    reviews: 5200,
    points: 50,
    image: "https://ik.imagekit.io/xpgowgcjw/Mjomba%20alinifira%20mpaka%20Mavi.png",
    trailerUrl: "https://www.youtube.com/embed/3JTVQTk36R8",
    embedUrl: "https://vidfast.vc/embed/movie/38757",
    downloadLinks: [
      { quality: "480p", size: "167MB", url: "#download-480p", host: "Download" },
    ],
    description: "<br><b>Tazama Full Video</b></br> Muda : dk25 Sek 30 Ukubwa: MB167.",
    duration: "1h 40min",
    year: 2026,
    subtitles: []
  },
  

  // ROMANCE SERIES
   {
    id: "series-romance-1",
    title: "Binamu alinitomba matako  bila Huruma",
    category: "Bila huruma",
    rating: 4.9,
    reviews: 5200,
    points: 50,
    image: "https://ik.imagekit.io/xpgowgcjw/Binamu%20alinitomba%20matako%20%20bila%20Huruma.png",
    trailerUrl: "https://www.youtube.com/embed/3JTVQTk36R8",
    embedUrl: "https://vidfast.vc/embed/movie/38757",
    downloadLinks: [
      { quality: "480p", size: "367MB", url: "#download-480p", host: "Download" },
    ],
    description: "Kutobwa tobwa tu.",
    duration: "1h 40min",
    year: 2026,
    subtitles: []
  },
  {
    id: "series-romance-2",
    title: "Malaya KUMA Chafu akitobwa bila huruma",
    category: "Bila huruma",
    rating: 4.9,
    reviews: 5200,
    points: 50,
    image: "https://ik.imagekit.io/xpgowgcjw/Malaya%20KUMA%20Chafu%20akitobwa%20bila%20huruma.png",
    trailerUrl: "https://www.youtube.com/embed/3JTVQTk36R8",
    embedUrl: "https://vidfast.vc/embed/movie/38757",
    downloadLinks: [
      { quality: "480p", size: "367MB", url: "#download-480p", host: "Download" },
    ],
    description: "Wasichana wa Duniani.",
    duration: "1h 40min",
    year: 2026,
    subtitles: []
  },
  {
    id: "series-romance-3",
    title: "Mama alifinya DUDU la mpaka langi",
    category: "Bila huruma",
    rating: 4.9,
    reviews: 5200,
    points: 50,
    image: "https://ik.imagekit.io/xpgowgcjw/Mama%20alifinya%20DUDU%20la%20mpaka%20langi.png",
    trailerUrl: "https://www.youtube.com/embed/3JTVQTk36R8",
    embedUrl: "https://vidfast.vc/embed/movie/38757",
    downloadLinks: [
      { quality: "480p", size: "367MB", url: "#download-480p", host: "Download" },
    ],
    description: "<br><b>Tazama Full Video</b></br> Muda : saa 1dk40 Ukubwa: MB207.",
    duration: "1h 40min",
    year: 2026,
    subtitles: []
  },
   {
    id: "series-romance-4",
    title: "PEPO LA KUTOMBANA",
    category: "Bila huruma",
    rating: 4.9,
    reviews: 5200,
    points: 50,
    image: "https://ik.imagekit.io/xpgowgcjw/PEPO%20LA%20KUTOMBANA.png",
    trailerUrl: "https://www.youtube.com/embed/3JTVQTk36R8",
    embedUrl: "https://vidfast.vc/embed/movie/38757",
    downloadLinks: [
      { quality: "480p", size: "367MB", url: "#download-480p", host: "Download" },
    ],
    description: "<br><b>Tazama Full Video</b></br> Muda : saa 1 Ukubwa: MB107 <br>Huyu demu anatomba wavulana</br>.",
    duration: "1h 40min",
    year: 2026,
    subtitles: []
  },
   {
    id: "series-romance-5",
    title: "Mtoto wa 2000 Akitobwa Kama Chizi",
    category: "Bila huruma",
    rating: 4.9,
    reviews: 5200,
    points: 50,
    image: "https://ik.imagekit.io/xpgowgcjw/Mtoto%20wa%202000%20Akitobwa%20Kama%20Chizi.jpg",
    trailerUrl: "https://www.youtube.com/embed/3JTVQTk36R8",
    embedUrl: "https://vidfast.vc/embed/movie/38757",
    downloadLinks: [
      { quality: "480p", size: "367MB", url: "#download-480p", host: "Download" },
    ],
    description: "Demu kaja gheto kuma kachapwa bila Huruma",
    duration: "1h 40min",
    year: 2026,
    subtitles: []
  },
   {
    id: "series-romance-6",
    title: "Nlilamba DUDU kisa Iphone 17",
    category: "Bila huruma",
    rating: 4.9,
    reviews: 5200,
    points: 50,
    image: "https://ik.imagekit.io/xpgowgcjw/Nlilamba%20DUDU%20kisa%20Iphone%2017.png",
    trailerUrl: "https://www.youtube.com/embed/3JTVQTk36R8",
    embedUrl: "https://vidfast.vc/embed/movie/38757",
    downloadLinks: [
      { quality: "480p", size: "367MB", url: "#download-480p", host: "Download" },
    ],
    description: "",
    duration: "1h 40min",
    year: 2026,
    subtitles: []
  },
   {
    id: "series-romance-7",
    title: "Shemeji Alizamisha BOLO lote Kumani",
    category: "Bila huruma",
    rating: 4.9,
    reviews: 5200,
    points: 50,
    image: "https://ik.imagekit.io/xpgowgcjw/Shemeji%20Alizamisha%20BOLO%20lote%20Kumani.jpeg",
    trailerUrl: "https://www.youtube.com/embed/3JTVQTk36R8",
    embedUrl: "https://vidfast.vc/embed/movie/38757",
    downloadLinks: [
      { quality: "480p", size: "367MB", url: "#download-480p", host: "Download" },
    ],
    description: " Duniani.",
    duration: "1h 40min",
    year: 2026,
    subtitles: []
  },
   {
    id: "series-romance-8",
    title: "Napenda Sana Kutobwa bila Huruma",
    category: "Bila huruma",
    rating: 4.9,
    reviews: 5200,
    points: 50,
    image: "https://ik.imagekit.io/xpgowgcjw/Napenda%20Sana%20Kutobwa%20bila%20Huruma.png",
    trailerUrl: "https://www.youtube.com/embed/3JTVQTk36R8",
    embedUrl: "https://vidfast.vc/embed/movie/38757",
    downloadLinks: [
      { quality: "480p", size: "367MB", url: "#download-480p", host: "Download" },
    ],
    description: "",
    duration: "1h 40min",
    year: 2026,
    subtitles: []
  },
   {
    id: "series-romance-9",
    title: "Tanua Mkundu Upate Ajira",
    category: "Bila huruma",
    rating: 4.9,
    reviews: 5200,
    points: 50,
    image: "https://ik.imagekit.io/xpgowgcjw/Tanua%20Mkundu%20Upate%20Hela.jpeg",
    trailerUrl: "https://www.youtube.com/embed/3JTVQTk36R8",
    embedUrl: "https://vidfast.vc/embed/movie/38757",
    downloadLinks: [
      { quality: "480p", size: "367MB", url: "#download-480p", host: "Download" },
    ],
    description: "",
    duration: "1h 40min",
    year: 2026,
    subtitles: []
  },
  {
    id: "series-romance-10",
    title: "Bridgerton",
    category: "Tomba kabisa",
    rating: 4.7,
    reviews: 8500,
    points: 80,
    image: "https://res.cloudinary.com/dqlgbcalk/image/upload/v1778512691/violet_cqfzsm.jpg",
    trailerUrl: "https://www.youtube.com/embed/gpv7ayf_tyE",
    description: "Familia .",
    duration: "Series",
    year: 2024,
    subtitles: [
      { lang: "en", label: "English", url: "" }
    ], 
  },
];

// Keep every category useful for browsing while the catalog is being populated.
const CATEGORY_TARGETS = ['Warembo', 'Baikoko', 'Bila huruma', 'Tomba kabisa', 'Lazimishwa'];
CATEGORY_TARGETS.forEach(category => {
  const categoryItems = CONTENT.filter(item => item.category === category && !item.isSeries);
  const template = categoryItems[categoryItems.length - 1] || CONTENT.find(item => item.category === category);
  if (!template) return;

  for (let index = categoryItems.length; index < 10; index += 1) {
    CONTENT.push({
      ...template,
      id: `${category.toLowerCase().replace(/\\s+/g, '-')}-trailer-${index + 1}`,
      title: `${category} Trailer ${String(index + 1).padStart(2, '0')}`,
      description: `Trailer mpya kutoka kwenye kundi la ${category}.`,
      isSeries: false,
      seasons: undefined
    });
  }
});
