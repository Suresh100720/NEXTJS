import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Job from '@/models/Job';
import Candidate from '@/models/Candidate';

export async function GET() {
  try {
    await connectDB();
    const activeJobsCount = await Job.countDocuments({ status: { $in: ['Active', 'Hiring', 'Urgently Hiring'] } });
    const totalCandidates = await Candidate.countDocuments();
    const onHold = await Candidate.countDocuments({ status: 'On Hold' });
    const shortlisted = await Candidate.countDocuments({ status: 'Shortlisted' });
    const rejected = await Candidate.countDocuments({ status: 'Rejected' });
    const finalised = await Candidate.countDocuments({ status: 'Finalised' });
    const screening = await Candidate.countDocuments({ status: 'Screening' });

    const acquisitions = {
      applications: 100,
      shortlisted: totalCandidates ? Math.round((shortlisted / totalCandidates) * 100) : 0,
      rejected: totalCandidates ? Math.round((rejected / totalCandidates) * 100) : 0,
      onHold: totalCandidates ? Math.round((onHold / totalCandidates) * 100) : 0,
      finalised: totalCandidates ? Math.round((finalised / totalCandidates) * 100) : 0,
    };

    const weeklyStats = [];
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    for (let i = 6; i >= 0; i--) {
      const dayStart = new Date();
      dayStart.setHours(0, 0, 0, 0);
      dayStart.setDate(dayStart.getDate() - i);
      
      const dayEnd = new Date(dayStart);
      dayEnd.setDate(dayStart.getDate() + 1);

      const count = await Candidate.countDocuments({
        createdAt: { $gte: dayStart, $lt: dayEnd }
      });
      
      const shortCount = await Candidate.countDocuments({
        status: 'Shortlisted',
        createdAt: { $gte: dayStart, $lt: dayEnd }
      });

      const rejCount = await Candidate.countDocuments({
        status: 'Rejected',
        createdAt: { $gte: dayStart, $lt: dayEnd }
      });

      weeklyStats.push({ 
        name: days[dayStart.getDay()], 
        apps: count, 
        short: shortCount, 
        rej: rejCount 
      });
    }
    
    const recentJobs = await Job.find().sort({ createdAt: -1 }).limit(3);

    return NextResponse.json({ 
      activeJobs: activeJobsCount, 
      totalCandidates, 
      onHold, 
      shortlisted, 
      rejected,
      finalised,
      screening,
      acquisitions,
      weeklyStats,
      recentJobs
    });
  } catch (error) {
    return NextResponse.json({ message: (error as Error).message }, { status: 500 });
  }
}
