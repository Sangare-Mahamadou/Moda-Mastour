import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    
    if (!file) {
      return NextResponse.json({ error: "Aucun fichier reçu." }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    // Nom de fichier unique
    const filename = Date.now() + "_" + file.name.replaceAll(' ', '_');
    
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    
    // Créer le dossier s'il n'existe pas
    try {
      await mkdir(uploadDir, { recursive: true });
    } catch(e) {}
    
    await writeFile(path.join(uploadDir, filename), buffer);
    
    const imageUrl = `/uploads/${filename}`;
    return NextResponse.json({ success: true, imageUrl });

  } catch (error) {
    console.error("Erreur d'upload :", error);
    return NextResponse.json({ error: "Échec de l'upload." }, { status: 500 });
  }
}
