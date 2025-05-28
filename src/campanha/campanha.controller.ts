import { Body, Controller, Get, Post } from '@nestjs/common';
import { CampanhaService } from './campanha.service';

@Controller('campanhas')
export class CampanhaController {
    constructor(private readonly campanhaService: CampanhaService) {}

    @Get('ativas')
    async getCampaigns() {
        return await this.campanhaService.getCampaigns();
    }

    @Post('create-donation')
    async createDonation(@Body() data) {
        return await this.campanhaService.createDonation(data);
    }

    @Post('generate-description')
  async generateDescription(@Body('prompt') data) {
    return this.campanhaService.generateCampaignDescription(data);
  }

  @Post('generate-image')
  async generateImage(@Body('prompt') data) {
    return this.campanhaService.generateImage(data);
  }
}
