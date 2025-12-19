// Script to populate testimonials and FAQs collections via API
const testimonials = [
  {
    name: "Ayaan Cabdi",
    role: "Frontend Developer",
    tag: "Built strong web design skills",
    image: "https://randomuser.me/api/portraits/women/44.jpg",
    quote: "Xirfadbare waa goob waxbarasho oo runtii wax ka bedeshay xirfadeyda. Tababarka iyo hagidda macallimiinta ayaa iga dhigay inaan si kalsooni leh u dhiso web apps xirfad leh.",
    rating: 5,
    order: 1,
  },
  {
    name: "Mohamed Abdi",
    role: "Full Stack Engineer",
    tag: "From learner to tech professional",
    image: "https://randomuser.me/api/portraits/men/41.jpg",
    quote: "Markii aan ku biiray Xirfadbare, waxaan bartay React, Node.js, iyo MongoDB. Waxay i siisay xirfad dhab ah iyo kalsooni aan shaqo ku helo si dhakhso ah.",
    rating: 5,
    order: 2,
  },
  {
    name: "Hodan Yusuf",
    role: "UI/UX Designer",
    tag: "Mastered modern design tools",
    image: "https://randomuser.me/api/portraits/women/31.jpg",
    quote: "Casharrada Xirfadbare waa kuwo la fahmi karo oo lagu tababaro si wax ku ool ah. Maanta waxaan si xirfad leh u isticmaalaa Figma iyo UX principles-ka casriga ah.",
    rating: 5,
    order: 3,
  },
  {
    name: "Khalid Ahmed",
    role: "Backend Developer",
    tag: "Enhanced API and database skills",
    image: "https://randomuser.me/api/portraits/men/53.jpg",
    quote: "Xirfadbare waxay i siisay aasaas adag oo ku saabsan backend development. Waxaan bartay Node.js, Express iyo MongoDB, taas oo iga dhigtay mid shaqadiisa si kalsooni leh u qabta.",
    rating: 5,
    order: 4,
  },
];

const faqs = [
  {
    question: "Sideen uga diiwaan gali karaa koorsooyinka Xirfadbare?",
    answer: "Tag bogga 'Courses', dooro koorsada aad rabto, kadib guji 'Enroll Now'. Waxaad heli doontaa fariin xaqiijin ah iyo tillaabooyinka xiga ee bixinta ama bilaabista koorsada.",
    category: "enrollment",
    order: 1,
    language: "so",
  },
  {
    question: "Koorsooyinka Xirfadbare ma bilaash baa mise waa lacag leh?",
    answer: "Xirfadbare waxay bixisaa koorsooyin bilaash ah iyo kuwo premium ah. Koorsooyinka premium waxay bixiyaan waxyaabo dheeraad ah sida hagitaan toos ah, support gaar ah iyo fursado shaqo.",
    category: "pricing",
    order: 2,
    language: "so",
  },
  {
    question: "Ma heli karaa taageero haddii aan dhibaato kala kulmo koorsada?",
    answer: "Haa, kooxda support-ka ee Xirfadbare ayaa diyaar u ah inay ku caawiso 24/7. Waxaad nala soo xiriiri kartaa email, chat, ama qaybta support-ka ee website-ka.",
    category: "support",
    order: 3,
    language: "so",
  },
  {
    question: "Macallimiinta Xirfadbare ma yihiin xirfadlayaal dhab ah?",
    answer: "Haa, dhammaan macallimiinta waa khubaro ka tirsan shirkado caan ah oo leh waayo-aragnimo toos ah, waxayna si firfircoon uga shaqeeyaan warshadaha Technology-ga.",
    category: "instructors",
    order: 4,
    language: "so",
  },
  {
    question: "Ma heli karaa shahaado marka aan dhameeyo koorsada?",
    answer: "Haa, dhammaan ardayda dhameeya koorsooyinka waxay helayaan shahaado rasmi ah oo lagu aqoonsan karo shaqooyinka iyo CV-gaaga si xirfad leh.",
    category: "certificates",
    order: 5,
    language: "so",
  },
  {
    question: "Mudo intee le'eg ayay koorsooyinka socdaan?",
    answer: "Koorsooyinka badankood waxay socdaan 4 ilaa 12 toddobaad, iyadoo ku xiran nooca koorsada iyo heerka aqoonta ardayga.",
    category: "duration",
    order: 6,
    language: "so",
  },
  {
    question: "Ma isticmaali karaa Xirfadbare meel kasta?",
    answer: "Haa, Xirfadbare waa madal online ah. Waxaad ku baran kartaa meel kasta iyo waqti kasta adigoo isticmaalaya kombiyuutar ama mobilkaaga.",
    category: "accessibility",
    order: 7,
    language: "so",
  },
  {
    question: "Ma jiraan casharro ku saabsan xirfadaha shaqo raadinta?",
    answer: "Haa, Xirfadbare waxay bixisaa tababaro gaar ah oo kaa caawinaya diyaarinta CV-ga, wareysiyada shaqo, iyo xirfadaha soft skills ee loo baahan yahay suuqa shaqada maanta.",
    category: "career",
    order: 8,
    language: "so",
  },
];

async function populateCollections() {
  console.log('🚀 Starting to populate testimonials and FAQs collections...\n');

  // Populate testimonials
  console.log('📝 Adding testimonials...');
  for (let i = 0; i < testimonials.length; i++) {
    try {
      const response = await fetch('http://localhost:5000/api/testimonials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testimonials[i]),
      });

      if (response.ok) {
        const result = await response.json();
        console.log(`✅ Testimonial ${i + 1}: ${testimonials[i].name}`);
      } else {
        console.log(`❌ Failed testimonial ${i + 1}: ${response.status}`);
      }
    } catch (error) {
      console.error(`❌ Error testimonial ${i + 1}:`, error.message);
    }
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  console.log('\n📝 Adding FAQs...');
  // Populate FAQs
  for (let i = 0; i < faqs.length; i++) {
    try {
      const response = await fetch('http://localhost:5000/api/faqs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(faqs[i]),
      });

      if (response.ok) {
        const result = await response.json();
        console.log(`✅ FAQ ${i + 1}: ${faqs[i].question.substring(0, 40)}...`);
      } else {
        console.log(`❌ Failed FAQ ${i + 1}: ${response.status}`);
      }
    } catch (error) {
      console.error(`❌ Error FAQ ${i + 1}:`, error.message);
    }
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  console.log('\n🎉 Collections population completed!');
  console.log('📊 Summary:');
  console.log(`   - ${testimonials.length} testimonials added to 'testimonials' collection`);
  console.log(`   - ${faqs.length} FAQs added to 'faqs' collection`);
  console.log('\n🔄 Refresh your browser to see the real data!');
}

populateCollections().catch(console.error);


