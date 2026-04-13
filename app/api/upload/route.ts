import { NextResponse } from 'next/server';
import { put } from '@vercel/blob';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    
    if (!file) {
      return NextResponse.json({ error: "Aucun fichier reçu." }, { status: 400 });
    }

    const filename = Date.now() + "_" + file.name.replaceAll(' ', '_');
    
    // Upload de l'image directement dans le nuage Vercel (Blob Storage)
    const blob = await put(`uploads/${filename}`, file, {
      access: 'public',
      token: process.env.BLOB_READ_WRITE_TOKEN || 'vercel_blob_rw_DfZ5C9fDScx5Casf_dac2bJqA1jvVVqwS7hOq6PtNbw5dha'
    });
    
    return NextResponse.json({ success: true, imageUrl: blob.url });

  } catch (error: any) {
    console.error("Erreur d'upload Vercel Blob :", error);
    return NextResponse.json({ 
      error: "Échec de l'upload.",
      details: error?.message || 'Erreur inconnue'
    }, { status: 500 });
  }
}

