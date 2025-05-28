import { Controller, Get, Post, Body, UploadedFile, UseInterceptors, UseGuards, Param, Patch } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { DashboardService } from './dashboard.service';
import { AuthGuard } from '../auth/auth.guard';
import { Campaign } from './dtos/createCampanh.dto';

@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Post('/create-campaign')
  createCampaign(@Body() data: Campaign) {
    return this.dashboardService.createCampaign(data);
  }


  @Get('/campanhas')
  getCampaigns() {
    return this.dashboardService.getCampaigns();
  }

  @Get('/campanhas/:id') 
  getCampaignById(@Param('id') id: string) {
    return this.dashboardService.getCampanha(id);
  }

@UseGuards(AuthGuard)
  @Get('/campanhas/user/:id')
  getCampaignsByUserId(@Param('id') userId: string) {
    return this.dashboardService.getUserCampanha(userId);
  }

  @Post('/create-donation')
  createDonation(@Body() data: { campaignId: string; amount: number; doadorId: string; metodoPagamento: string }) {
    return this.dashboardService.createDonation(data.campaignId, data.amount, data.doadorId, data.metodoPagamento);
  }

  @UseGuards(AuthGuard)
  @Get('/donations/user/:id')
  getDonationsByUserId(@Param('id') userId: string) {
    return this.dashboardService.getDonationsByUser(userId);
  }

  @UseGuards(AuthGuard)
  @Patch('/update-campaign/:id')
  updateCampaign(@Param('id') id: string, @Body() data: Partial<{ titulo: string; descricao: string; status: string }>) {
    return this.dashboardService.editCampanha(id, data);
  }

  @Post('/donation/confirm/:donationId')
  confirmDonation(@Param('donationId') donationId: string) {
    return this.dashboardService.confirmDonation(donationId);
  }

  @Post('/create-withdraw')
  createWithdraw(@Body() data: { nome: string; userId: string; valor: number; pix: string }) {
      return this.dashboardService.createWithdraw(data.nome, data.userId, data.valor, data.pix);
  }

  @Get('/withdraw/user/:id')
    getWithdrawsByUserId(@Param('id') userId: string) {
      return this.dashboardService.getWithdrawals(userId);
    }

  @Post('/upload-image')
  @UseInterceptors(FileInterceptor('file'))
  uploadImage(@UploadedFile() file: Express.Multer.File) {
    return this.dashboardService.image(file);
  }
}
