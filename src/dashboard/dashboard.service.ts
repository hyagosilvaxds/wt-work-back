import { Injectable, UseGuards } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Express } from 'express';
import { Cron } from '@nestjs/schedule';
import { AuthGuard } from '../auth/auth.guard';
import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';

interface CreateCampaignDto {
  imagem: string;
  titulo: string;
  meta: number;
  dataFim: string;
  descricao: string;
  historia: string;
  tipoOrganizador: 'individual' | 'organizacao';
  nomeOrganizador: string;
  documentoOrganizador: string;
  emailOrganizador: string;
  telefoneOrganizador: string;
  userId: string;
}

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async createCampaign(data: CreateCampaignDto): Promise<any> {
    try {
      // Salvar informações do organizador
      const organizador = await this.prisma.organizador.create({
        data: {
          tipodeOrganizador: data.tipoOrganizador,
          nome: data.nomeOrganizador,
          email: data.emailOrganizador,
          telefone: data.telefoneOrganizador,
          doc: data.documentoOrganizador,
        },
      });

      console.log(data);

      // Criar a campanha vinculada ao organizador
      const campaign = await this.prisma.campanha.create({
        data: {
          nome: data.titulo,
          valorMeta: Number(data.meta), 
          imagem: data.imagem,
          dataFim: new Date(data.dataFim),
          descricao: data.descricao,
          descricaoCompleta: data.historia, 
          organizadorId: organizador.id, 
          dataInicio: new Date(), 
          valorArrecadado: 0, 
          status: 'pendente', 
          userId: data.userId,
        },
      });
      return campaign;
    } catch (error) {
      throw new Error('Erro ao criar a campanha: ' + error.message);
    }
  }


  async getCampaigns(): Promise<any[]> {
    try {
      const currentDate = new Date();
      const campaigns = await this.prisma.campanha.findMany({
        where: {
          dataFim: {
            gt: currentDate,
          },
        },
      });
      return campaigns;
    } catch (error) {
      throw new Error('Erro ao buscar campanhas: ' + error.message);
    }
  }

  async getCampanha(id: string): Promise<any> {
    try {
      const campanha = await this.prisma.campanha.findUnique({
        where: {
          id: id,
        },
        include: {
          doacoes: true, // Inclui as doações relacionadas à campanha
        },
      });
      if (!campanha) {
        throw new Error('Campanha não encontrada');
      }

      // Adiciona o número de doadores ao retorno
      const numeroDoadores = campanha.doacoes.length;

      return { ...campanha, numeroDoadores };
    } catch (error) {
      throw new Error('Erro ao buscar campanha: ' + error.message);
    }
  }

  async getUserCampanha(userId: string): Promise<any[]> {
    try {
      const campanhas = await this.prisma.campanha.findMany({
        where: {
          userId: userId,
        },
      });
      return campanhas;
    } catch (error) {
      throw new Error('Erro ao buscar campanhas do usuário: ' + error.message);
    }
  }

  async updateCampaignStatus(): Promise<void> {
    try {
      const currentDate = new Date();
      await this.prisma.campanha.updateMany({
        where: {
          dataFim: {
            lt: currentDate,
          },
          status: {
            not: 'encerrada',
          },
        },
        data: {
          status: 'encerrada',
        },
      });
    } catch (error) {
      throw new Error('Erro ao atualizar status das campanhas: ' + error.message);
    }
  }

  @Cron('0 0 * * *')
  async handleCron() {
    await this.updateCampaignStatus();
  }

  async createDonation(campaignId: string, amount: number, metodoPagamento: string, userId?: string): Promise<any> {
    try {
      if (!campaignId) {
        throw new Error('O ID da campanha é obrigatório.');
      }

      const platformFee = amount * 0.05; // Calcula 5% do valor como taxa da plataforma

      const donation = await this.prisma.doacao.create({
        data: {
          campanhaId: campaignId,
          valor: amount,
          userId: userId,
          taxaPlataforma: platformFee, // Adiciona a taxa da plataforma
          data: new Date(),
          metodoPagamento: metodoPagamento,
        },
      });

      return donation;
    } catch (error) {
      throw new Error('Erro ao criar doação: ' + error.message);
    }
  }

  async getDonationsByCampaign(campaignId: string): Promise<any[]> {
    try {
      const donations = await this.prisma.doacao.findMany({
        where: {
          campanhaId: campaignId,
        },
      });
      return donations;
    } catch (error) {
      throw new Error('Erro ao buscar doações da campanha: ' + error.message);
    }
  }

  async getDonationsByUser(userId: string): Promise<any[]> {
    try {
      const donations = await this.prisma.doacao.findMany({
        where: {
          campanha: {
            userId: userId,
          },
        },
        include: {
          campanha: true,
          user: true, // Inclui informações do usuário relacionado
          // doador: { // Removido devido à exclusão do modelo Doador
          //   select: {
          //     email: true, // Inclui o email do doador
          //   },
          // },
        },
      });
      return donations;
    } catch (error) {
      throw new Error('Erro ao buscar doações do usuário: ' + error.message);
    }
  }

  async editCampanha(campaignId: string, data: Partial<{ titulo: string; descricao: string; status: string }>): Promise<any> {
    try {
      const updatedCampaign = await this.prisma.campanha.update({
        where: {
          id: campaignId,
        },
        data: {
          ...data,
        },
      });
      return updatedCampaign;
    } catch (error) {
      throw new Error('Erro ao editar campanha: ' + error.message);
    }
  }

  async confirmDonation(donationId: string): Promise<any> {
    try {
      // Buscar a doação pelo ID
      const donation = await this.prisma.doacao.findUnique({
        where: {
          id: donationId,
        },
        include: {
          campanha: true, // Inclui informações da campanha relacionada
        },
      });

      if (!donation) {
        throw new Error('Doação não encontrada');
      }

      if (donation.status === 'confirmada') {
        throw new Error('Doação já confirmada');
      }

      // Incrementar o valor arrecadado da campanha
      await this.prisma.campanha.update({
        where: {
          id: donation.campanhaId,
        },
        data: {
          valorArrecadado: {
            increment: donation.valor - donation.taxaPlataforma,
          },
        },
      });

      // Incrementar o saldo do usuário dono da campanha
      await this.prisma.user.update({
        where: {
          id: donation.campanha.userId,
        },
        data: {
          saldo: {
            increment: donation.valor - donation.taxaPlataforma,
          },
        },
      });

      // Alterar o status da doação para confirmada
      const updatedDonation = await this.prisma.doacao.update({
        where: {
          id: donationId,
        },
        data: {
          status: 'confirmada',
        },
      });

      return updatedDonation;
    } catch (error) {
      throw new Error('Erro ao confirmar doação: ' + error.message);
    }
  }

  async createWithdraw(nome: string, userId: string, valor: number, pix: string): Promise<any> {
    try {
      // Verificar se o usuário tem saldo suficiente
      const user = await this.prisma.user.findUnique({
        where: {
          id: userId,
        },
      });

      if (!user) {
        throw new Error('Usuário não encontrado');
      }

      if (valor > user.saldo) {
        throw new Error('Saldo insuficiente para realizar o saque');
      }

      // Criar o registro de saque
      const saque = await this.prisma.saques.create({
        data: {
          userId: userId,
          valor: valor,
          chavePIX: pix,
          data: new Date(),
          nomeCompleto: nome, // Assuming 'nomeCompleto' is a field in the user object
        },
      });

      // Subtrair o valor do saque do saldo do usuário
      await this.prisma.user.update({
        where: {
          id: userId,
        },
        data: {
          saldo: {
            decrement: valor,
          },
        },
      });

      return saque;
    } catch (error) {
      throw new Error('Erro ao criar saque: ' + error.message);
    }
  }

  async getUserSaldo(userId: string): Promise<any> {
    try {
      const user = await this.prisma.user.findUnique({
        where: {
          id: userId,
        },
        select: {
          saldo: true,
        },
      });

      if (!user) {
        throw new Error('Usuário não encontrado');
      }

      return { saldo: user.saldo };
    } catch (error) {
      throw new Error('Erro ao buscar saldo do usuário: ' + error.message);
    }
  }

  async getWithdrawals(userId: string): Promise<any[]> {
    try {
      const withdrawals = await this.prisma.saques.findMany({
        where: {
          userId: userId,
        },
      });
      return withdrawals;
    } catch (error) {
      throw new Error('Erro ao buscar saques do usuário: ' + error.message);
    }
  }

  async confirmWithdraw(withdrawId: string): Promise<any> {
    try {
      const withdraw = await this.prisma.saques.findUnique({
        where: {
          id: withdrawId,
        },
      });

      if (!withdraw) {
        throw new Error('Saque não encontrado');
      }

      if (withdraw.status === 'confirmado') {
        throw new Error('Saque já confirmado');
      }

      const updatedWithdraw = await this.prisma.saques.update({
        where: {
          id: withdrawId,
        },
        data: {
          status: 'confirmado',
        },
      });

      return updatedWithdraw;
    } catch (error) {
      throw new Error('Erro ao confirmar saque: ' + error.message);
    }
  }

  async image(file: Express.Multer.File): Promise<string> {
    try {
      if (!file) {
        throw new Error('Arquivo de imagem não fornecido.');
      }

      const uploadDir = path.join(__dirname, '../../uploads');

      // Certifique-se de que o diretório de upload existe
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      const uniqueFilename = `${uuidv4()}-${file.originalname}`;
      const filePath = path.join(uploadDir, uniqueFilename);

      // Salvar o arquivo no disco
      fs.writeFileSync(filePath, file.buffer);

      // Retornar a URL do arquivo
      const fileUrl = `/uploads/${uniqueFilename}`;
      return fileUrl;
    } catch (error) {
      throw new Error('Erro ao salvar a imagem: ' + error.message);
    }
  }

}









