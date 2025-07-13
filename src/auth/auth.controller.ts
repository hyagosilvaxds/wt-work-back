import { Body, Controller, Get, Post, Request, UseGuards } from '@nestjs/common';
import { SignInDto, SignUpDto } from './dtos/auth';
import { AuthService } from './auth.service';
import { AuthGuard } from './auth.guard';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) {}
    
    @Post('signin')
    async signIn(@Body() body:SignInDto) {

        return this.authService.signIn(body);
    }

    @Post('signup')
    async signUp(@Body() body: SignUpDto ) {
        return this.authService.signUp(body);
    }

    @UseGuards(AuthGuard)
    @Post('select-role')
    async selectRole(@Body() body: { role: string, userId: string }) {
        return this.authService.selectRole(body.role, body.userId);
    }

    @UseGuards(AuthGuard)
    @Get('me')
    async me() {
        return 'logado';
    }

    @UseGuards(AuthGuard)
    @Get('permissions')
    async getUserPermissions(@Request() req) {
        const userId = req.user.id; // Extraído do JWT pelo AuthGuard
        return this.authService.getUserPermissions(userId);
    }
}
