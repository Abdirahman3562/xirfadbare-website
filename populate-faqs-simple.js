// Script to add FAQs via API calls
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

async function addFAQs() {
  console.log('🚀 Adding FAQs to database via API...');

  for (const faq of faqs) {
    try {
      console.log(`📝 Adding: ${faq.question.substring(0, 50)}...`);

      const response = await fetch('http://localhost:5000/api/faqs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(faq),
      });

      if (response.ok) {
        const result = await response.json();
        console.log(`✅ Success: ${faq.question.substring(0, 30)}... (ID: ${result._id})`);
      } else {
        console.log(`❌ Failed: ${faq.question.substring(0, 30)}... - Status: ${response.status}`);
      }
    } catch (error) {
      console.error(`❌ Error: ${faq.question.substring(0, 30)}... - ${error.message}`);
    }

    // Small delay
    await new Promise(resolve => setTimeout(resolve, 200));
  }

  console.log('🎉 All FAQs processed!');
}

addFAQs();


