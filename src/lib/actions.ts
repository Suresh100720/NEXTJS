'use server';

import { revalidatePath } from 'next/cache';
import connectDB from '@/lib/db';
import Job from '@/models/Job';
import Candidate from '@/models/Candidate';

// SERVER ACTION: Job Create/Update
export async function handleJobAction(prevState: any, formData: FormData) {
  try {
    await connectDB();
    const id = formData.get('id');
    const jobData = {
      title: formData.get('title'),
      department: formData.get('department'),
      type: formData.get('type'),
      status: formData.get('status'),
      experience: formData.get('experience'),
      openings: Number(formData.get('openings')),
    };

    if (id) {
      await Job.findByIdAndUpdate(id, jobData);
    } else {
      await new Job(jobData).save();
    }

    revalidatePath('/jobs');
    revalidatePath('/dashboard');
    return { success: true, message: 'Job saved successfully' };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

// SERVER ACTION: Job Delete
export async function deleteJobAction(id: string) {
  try {
    await connectDB();
    await Job.findByIdAndDelete(id);
    revalidatePath('/jobs');
    revalidatePath('/dashboard');
    return { success: true };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

// SERVER ACTION: Candidate Create/Update
export async function handleCandidateAction(prevState: any, formData: FormData) {
  try {
    await connectDB();
    const id = formData.get('id');
    
    // Parse skills from hidden field (set by client-side picker)
    const skillsString = formData.get('skills') as string;
    const skills = skillsString ? JSON.parse(skillsString) : [];

    const candidateData = {
      name: formData.get('name'),
      email: formData.get('email'),
      role: formData.get('role'),
      status: formData.get('status') || 'Screening',
      experience: formData.get('experience'),
      skills: skills,
    };

    if (id) {
      await Candidate.findByIdAndUpdate(id, candidateData);
    } else {
      await new Candidate(candidateData).save();
    }

    revalidatePath('/candidates');
    revalidatePath('/dashboard');
    return { success: true, message: 'Candidate saved successfully' };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

// SERVER ACTION: Candidate Delete
export async function deleteCandidateAction(id: string) {
  try {
    await connectDB();
    await Candidate.findByIdAndDelete(id);
    revalidatePath('/candidates');
    revalidatePath('/dashboard');
    return { success: true };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

// SERVER ACTION: CV Enrichment (using high-performance PDF engine)
export async function enrichCVAction(formData: FormData) {
  console.log('--- ENRICH CV ACTION STARTED ---');
  try {
    const file = formData.get('cv') as File;
    if (!file) return { error: 'No file provided' };

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const fileName = file.name.toLowerCase();
    
    let cvText = '';
    
    if (fileName.endsWith('.pdf')) {
      try {
        const { getDocumentProxy } = await import('unpdf');
        const doc = await getDocumentProxy(new Uint8Array(buffer));
        let fullText = '';
        for (let i = 1; i <= doc.numPages; i++) {
          const page = await doc.getPage(i);
          const content = await page.getTextContent();
          fullText += content.items.map((item: any) => item.str).join(' ') + '\n';
        }
        cvText = fullText.trim();
      } catch (err: any) {
        return { error: `PDF extraction failed: ${err.message}` };
      }
    } else if (fileName.endsWith('.docx')) {
      const mammoth = require('mammoth');
      const result = await mammoth.extractRawText({ buffer });
      cvText = result.value || '';
    } else {
      cvText = buffer.toString('utf8') || '';
    }

    if (!cvText || cvText.length < 10) {
      return { error: 'No readable text found in the document.' };
    }

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          {
            role: 'system',
            content: 'Analyze CV and return JSON: { name, email, skills: [], experience: string, suggestedRole: string }. Experience must be "Fresher", "1", "2", "3", "4", "5", "6", or "7+".'
          },
          { role: 'user', content: cvText }
        ],
        response_format: { type: 'json_object' }
      }),
    });

    const result = await response.json();
    if (result.error) throw new Error(result.error.message);
    return JSON.parse(result.choices[0].message.content);
  } catch (error: any) {
    return { error: `Enrichment failed: ${error.message}` };
  }
}
