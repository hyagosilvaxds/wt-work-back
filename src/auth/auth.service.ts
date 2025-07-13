import { Injectable, UnauthorizedException } from '@nestjs/common';
import { SignInDto, SignUpDto } from './dtos/auth';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
    constructor(private prismaService: PrismaService, private jwtService: JwtService) {}

    async signIn(data: SignInDto) {
        const user = await this.prismaService.user.findUnique({
            where: {
                email: data.email,
            },
        });

        if (!user) {
            throw new UnauthorizedException('Usuário não encontrado');
        }

        if (!user.password) {
            throw new UnauthorizedException('Usuário sem senha definida');
        }

        const validPassword = await bcrypt.compare(data.password, user.password);
        if (!validPassword) {
            throw new UnauthorizedException('Credenciais inválidas');
        }

        const accessToken = await this.jwtService.signAsync({
            id: user.id,
            roleId: user.roleId,
        });

        return {
            user: {
                name: user.name,
                email: user.email,
                id: user.id,
                roleId: user.roleId,
            },
            accessToken,
        };
    }

    async signUp(data: SignUpDto) {
        const userAlreadyExists = await this.prismaService.user.findUnique({
            where: {
                email: data.email,
            },
        });

        if (userAlreadyExists) {
            throw new UnauthorizedException('Esse usuário já existe. Caso já tenha uma conta, faça login!');
        }

        const hashedPassword = await bcrypt.hash(data.password, 10);

        const user = await this.prismaService.user.create({
            data: {
                ...data,
                password: hashedPassword,
            },
        });

        const accessToken = await this.jwtService.signAsync({
            id: user.id,

            roleId: user.roleId,
        });

        return {
            user: {
                name: user.name,
                email: user.email,
                id: user.id,
                roleId: user.roleId,
            },
            accessToken,
        };
    }

    async getUserPermissions(userId: string) {
        const user = await this.prismaService.user.findUnique({
            where: {
                id: userId,
            },
            include: {
                role: {
                    include: {
                        permissions: {
                            include: {
                                permission: true,
                            },
                        },
                    },
                },
            },
        });

        if (!user) {
            throw new UnauthorizedException('Usuário não encontrado');
        }

        if (!user.role) {
            throw new UnauthorizedException('Usuário não possui role definida');
        }

        // Extrair as permissões do usuário
        const permissions = user.role.permissions.map(rolePermission => ({
            id: rolePermission.permission.id,
            name: rolePermission.permission.name,
            description: rolePermission.permission.description,
        }));

        return {
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: {
                    id: user.role.id,
                    name: user.role.name,
                    description: user.role.description,
                },
            },
            permissions,
        };
    }

    async selectRole(roleId: string, userId: string) {
        const user = await this.prismaService.user.findUnique({
            where: {
                id: userId,
            },
        });
    
        if (!user) {
            throw new UnauthorizedException('Usuário não encontrado');
        }

        console.log('user', user);
        console.log('roleId', roleId);
    
        const updatedUser = await this.prismaService.user.update({
            where: {
                id: userId,
            },
            data: {
                roleId: roleId,
            },
        });
    
        const newAccessToken = await this.jwtService.signAsync({
            id: updatedUser.id,
            roleId: roleId,
        });

        return {
            user: {
                id: updatedUser.id,
                name: updatedUser.name,
                email: updatedUser.email,
                roleId: updatedUser.roleId,
            },
            accessToken: newAccessToken,
        };
    }
}