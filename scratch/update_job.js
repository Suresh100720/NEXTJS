const mongoose = require('mongoose');

async function updateJob() {
  try {
    await mongoose.connect('mongodb://localhost:27017/recruitment_db');
    console.log('Connected to MongoDB');

    const Job = mongoose.models.Job || mongoose.model('Job', new mongoose.Schema({
      title: String,
      department: String
    }));

    const job = await Job.findOne();
    if (!job) {
      console.log('No jobs found to update.');
      return;
    }

    const oldTitle = job.title;
    const newTitle = oldTitle.includes('(Updated)') 
      ? oldTitle.replace(' (Updated)', '') 
      : oldTitle + ' (Updated)';

    await Job.updateOne({ _id: job._id }, { title: newTitle });
    console.log(`Updated job "${oldTitle}" to "${newTitle}"`);
    
    await mongoose.disconnect();
  } catch (err) {
    console.error('Error:', err);
  }
}

updateJob();
