require('dotenv').config();
const mongoose = require('mongoose');
const Job = require('./models/Job');

const seedJobs = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    await Job.deleteMany(); // Clear existing jobs
    
    await Job.create([
      {
        title: "Remote Customer Support VA",
        employer: "Acme Corp",
        description: "Handle customer emails and phone calls. Training provided.",
        accommodations: ["read_aloud", "flexible_hours", "screen_reader_friendly"]
      },
      {
        title: "Data Entry Specialist",
        employer: "TechLogistics",
        description: "Enter shipping data into our internal system.",
        accommodations: ["screen_reader_friendly", "extra_interview_time"]
      }
    ]);
    
    console.log('✅ Jobs seeded successfully!');
    process.exit();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

seedJobs();