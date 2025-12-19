// Script to add testimonials via API calls
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

async function addTestimonials() {
  console.log('🚀 Starting to add testimonials via API...');

  for (let i = 0; i < testimonials.length; i++) {
    const testimonial = testimonials[i];

    try {
      console.log(`📝 Adding testimonial ${i + 1}: ${testimonial.name}`);

      const response = await fetch('http://localhost:5000/api/testimonials', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testimonial),
      });

      if (response.ok) {
        const result = await response.json();
        console.log(`✅ Successfully added: ${testimonial.name} (ID: ${result._id})`);
      } else {
        const error = await response.text();
        console.log(`❌ Failed to add ${testimonial.name}: ${response.status} - ${error}`);
      }
    } catch (error) {
      console.error(`❌ Error adding ${testimonial.name}:`, error.message);
    }

    // Small delay between requests
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  console.log('🎉 Finished adding testimonials!');
}

// Run the function
addTestimonials().catch(console.error);


