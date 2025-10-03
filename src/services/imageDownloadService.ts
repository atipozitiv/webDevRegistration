import axios from "axios";
import fs from "fs";
import path from "path";
import { processImage } from "./imageService";

export const downloadAndProcessImage = async (imageUrl: string): Promise<string> => {
  try {
    const response = await axios({
      method: 'GET',
      url: imageUrl,
      responseType: 'arraybuffer'
    });

    const fileExtension = path.extname(new URL(imageUrl).pathname) || '.jpg';
    const filename = `downloaded-${Date.now()}`;
    const tempFilePath = path.join(__dirname, '../../uploads', filename);

    fs.writeFileSync(tempFilePath, response.data as Buffer);

    const processedFilePath = await processImage(tempFilePath);

    return processedFilePath;
  } catch (error) {
    throw new Error(`Ошибка загрузки и обработки изображения: ${(error as Error).message}`);
  }
};