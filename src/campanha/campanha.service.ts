import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import OpenAI from 'openai';
import { writeFile } from 'fs/promises';

const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY, // Configure sua chave de API
  });

@Injectable()
export class CampanhaService {
  constructor(private readonly prisma: PrismaService) {}

  async getCampaigns(): Promise<any[]> {
    try {
      const currentDate = new Date();
      const campaigns = await this.prisma.campanha.findMany({
        where: {
          dataFim: {
            gt: currentDate,
          },
          status: "active",
        },
      });
      return campaigns;
    } catch (error) {
      throw new Error('Erro ao buscar campanhas: ' + error.message);
    }
  }

  async generateCampaignDescription(prompt: string): Promise<{ descricao: string; descricaoLonga: string }> {
    try {
      const response = await client.responses.create({
        model: "gpt-4o",
        input: prompt,
      });

      // Remove os delimitadores de código e caracteres indesejados
      const cleanedOutput = response.output_text
        .replace(/^```json\n?|```$/g, '') // Remove ```json e ```
        .trim(); // Remove espaços extras

      // Tenta fazer o parsing do JSON
      const output = JSON.parse(cleanedOutput);

      return {
        descricao: output.descricao,
        descricaoLonga: output.descricaoLonga,
      };
    } catch (error) {
      throw new Error('Erro ao gerar descrição da campanha: ' + error.message);
    }
  }

  async generateImage(prompt: string): Promise<string> {
    try {
      const img = await client.images.generate({
        model: "gpt-image-1",
        prompt: prompt,
        n: 1,
        size: "1536x1024",
      });

      if (!img.data?.[0]?.b64_json) {
        throw new Error('Imagem não gerada corretamente.');
      }
      const imageBuffer = Buffer.from(img.data[0].b64_json, "base64");
      const fileName = `uploads/${Date.now()}-landscape.png`;
      await writeFile(fileName, imageBuffer);

      return fileName;
    } catch (error) {
      throw new Error('Erro ao gerar imagem: ' + error.message);
    }
  }

  async createDonation(data: { campaignId: string; amount: number; moeda: string; cripto?: string; displayName: string; metodoPagamento: string; userId?: string; comment: string }): Promise<any> {
    try {
      const { campaignId, amount, moeda, cripto, displayName, metodoPagamento, userId, comment } = data;

      if (!campaignId) {
        throw new Error('O ID da campanha é obrigatório.');
      }

      const platformFee = amount * 0.05; // Calcula 5% do valor como taxa da plataforma

      const donation = await this.prisma.doacao.create({
        data: {
          campanhaId: campaignId,
          valor: amount,
          moeda: moeda,
          cripto: cripto ? Number(cripto) : undefined,
          userId: userId,
          taxaPlataforma: platformFee, // Adiciona a taxa da plataforma
          data: new Date(),
          metodoPagamento: metodoPagamento,
          displayName: displayName,
        },
      });

      const comentario = await this.prisma.comments.create({
        data: {
            campanhaId: campaignId,
            userId: userId ? userId : undefined,
            text: `Doação de ${amount} ${moeda} realizada por ${displayName}`,
            comment: comment,
            displayName: displayName,
            data: new Date(),
        },
      });

      return { donation, comentario };
    } catch (error) {
      throw new Error('Erro ao criar doação: ' + error.message);
    }
  }
}
