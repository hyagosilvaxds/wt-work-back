import { CreateClientDto, PatchClientDto } from './dto/client.dto';
import { LinkUserToClientDto } from './dto/client-link-user.dto';
import { UploadSignatureDto } from './dto/upload-signature.dto';
  
import { 
  Controller, 
  Get, 
  Post, 
  Put, 
  Delete, 
  Patch,
  Body, 
  Param, 
  Query, 
  UseGuards,
  HttpStatus,
  HttpCode,
  UsePipes,
  ValidationPipe,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import * as fs from 'fs';

import { SuperadminService } from './superadmin.service';
import { CreateClassDto, PatchClassDto } from './dto/class.dto';
import { AddStudentsToClassDto } from './dto/add-students-to-class.dto';
import { RemoveStudentsFromClassDto } from './dto/remove-students-from-class.dto';
import { CreateLessonDto, PatchLessonDto } from './dto/lesson.dto';
import { CreateLessonAttendanceDto, PatchLessonAttendanceDto } from './dto/lesson-attendance.dto';
import { CreateUserDto, UpdateUserDto, PatchUserDto, CreateRoleDto, UpdateRoleDto } from './dto/user.dto';
import { CreateInstructorUserDto, LinkUserToInstructorDto } from './dto/instructor.dto';
import { CreateTrainingDto } from './dto/create-training.dto';
import { AuthGuard } from '../auth/auth.guard';
import { PermissionsGuard } from '../auth/permissions.guard';
import { RequirePermissions } from '../auth/permissions.decorator';

@Controller('superadmin')
@UseGuards(AuthGuard, PermissionsGuard)
export class SuperadminController {

  // --- CLIENT CRUD ---

  @Post('clients')
  @RequirePermissions('CREATE_USERS')
  @HttpCode(HttpStatus.CREATED)
  @UsePipes(new ValidationPipe({ transform: true }))
  async createClient(@Body() createClientDto: CreateClientDto) {
    return this.superadminService.createClient(createClientDto);
  }

  @Get('clients/:id')
  @RequirePermissions('VIEW_USERS')
  async getClientById(@Param('id') id: string) {
    return this.superadminService.getClientById(id);
  }

  @Get('clients')
  @RequirePermissions('VIEW_USERS')
  async getClients(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
  ) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 10;
    return this.superadminService.getClients(pageNum, limitNum, search);
  }

  @Patch('clients/:id')
  @RequirePermissions('EDIT_USERS')
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async patchClient(
    @Param('id') id: string,
    @Body() patchDto: PatchClientDto,
  ) {
    return this.superadminService.patchClient(id, patchDto);
  }

  @Delete('clients/:id')
  @RequirePermissions('DELETE_USERS')
  @HttpCode(HttpStatus.OK)
  async deleteClient(@Param('id') id: string) {
    return this.superadminService.deleteClient(id);
  }

  @Post('clients/:id/link-user')
  @RequirePermissions('EDIT_USERS')
  @HttpCode(HttpStatus.CREATED)
  @UsePipes(new ValidationPipe({ transform: true }))
  async linkUserToClient(
    @Param('id') clientId: string,
    @Body() linkUserDto: LinkUserToClientDto,
  ) {
    return this.superadminService.linkUserToClient(clientId, linkUserDto);
  }
  constructor(private readonly superadminService: SuperadminService) {}

  // Listar todos os usuários
  @Get('users')
  @RequirePermissions('VIEW_USERS')
  async findAllUsers(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
  ) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 10;
    
    return this.superadminService.findAllUsers(pageNum, limitNum, search);
  }

  // Buscar usuário por ID
  @Get('users/:id')
  @RequirePermissions('VIEW_USERS')
  async findUserById(@Param('id') id: string) {
    return this.superadminService.findUserById(id);
  }

  // Criar novo usuário
  @Post('users')
  @RequirePermissions('CREATE_USERS')
  @HttpCode(HttpStatus.CREATED)
  @UsePipes(new ValidationPipe({ transform: true }))
  async createUser(@Body() createUserDto: CreateUserDto) {
    return this.superadminService.createUser(createUserDto);
  }

  // Criar novo instrutor
  @Post('instructors')
  @RequirePermissions('CREATE_USERS')
  @HttpCode(HttpStatus.CREATED)
  @UsePipes(new ValidationPipe({ transform: true }))
  async createInstructor(@Body() createInstructorUserDto: CreateInstructorUserDto) {
    return this.superadminService.createInstructor(createInstructorUserDto);
  }

  // Vincular usuário a instrutor existente
  @Post('instructors/link-user')
  @RequirePermissions('CREATE_USERS')
  @HttpCode(HttpStatus.CREATED)
  @UsePipes(new ValidationPipe({ transform: true }))
  async linkUserToInstructor(@Body() linkUserDto: LinkUserToInstructorDto) {
    return this.superadminService.linkUserToInstructor(linkUserDto);
  }

  // Atualizar usuário
  @Put('users/:id')
  @RequirePermissions('EDIT_USERS')
  @UsePipes(new ValidationPipe({ transform: true }))
  async updateUser(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.superadminService.updateUser(id, updateUserDto);
  }

  // Atualizar usuário parcialmente (PATCH)
  @Patch('users/:id')
  @RequirePermissions('EDIT_USERS')
  @UsePipes(new ValidationPipe({ transform: true }))
  async patchUser(
    @Param('id') id: string,
    @Body() patchUserDto: PatchUserDto,
  ) {
    return this.superadminService.patchUser(id, patchUserDto);
  }

  // Deletar usuário
  @Delete('users/:id')
  @RequirePermissions('DELETE_USERS')
  @HttpCode(HttpStatus.OK)
  async deleteUser(@Param('id') id: string) {
    return this.superadminService.deleteUser(id);
  }

  // Alternar status ativo/inativo do usuário
  @Patch('users/:id/toggle-status')
  @RequirePermissions('EDIT_USERS')
  async toggleUserStatus(@Param('id') id: string) {
    return this.superadminService.toggleUserStatus(id);
  }

  // Listar todos os roles disponíveis
  @Get('roles')
  @RequirePermissions('VIEW_ROLES')
  async findAllRoles() {
    return this.superadminService.findAllRoles();
  }

  // Buscar role por ID
  @Get('roles/:id')
  @RequirePermissions('VIEW_ROLES')
  async findRoleById(@Param('id') id: string) {
    return this.superadminService.findRoleById(id);
  }

  // Criar novo role
  @Post('roles')
  @RequirePermissions('CREATE_ROLES')
  @HttpCode(HttpStatus.CREATED)
  @UsePipes(new ValidationPipe({ transform: true }))
  async createRole(@Body() createRoleDto: CreateRoleDto) {
    return this.superadminService.createRole(
      createRoleDto.name,
      createRoleDto.description,
      createRoleDto.permissionIds
    );
  }

  // Atualizar role existente
  @Put('roles/:id')
  @RequirePermissions('EDIT_ROLES')
  @UsePipes(new ValidationPipe({ transform: true }))
  async updateRole(
    @Param('id') id: string,
    @Body() updateRoleDto: UpdateRoleDto,
  ) {
    return this.superadminService.updateRole(
      id,
      updateRoleDto.name,
      updateRoleDto.description,
      updateRoleDto.permissionIds
    );
  }

  // Atualizar role parcialmente (PATCH)
  @Patch('roles/:id')
  @RequirePermissions('EDIT_ROLES')
  @UsePipes(new ValidationPipe({ transform: true }))
  async patchRole(
    @Param('id') id: string,
    @Body() updateRoleDto: UpdateRoleDto,
  ) {
    return this.superadminService.patchRole(
      id,
      updateRoleDto.name,
      updateRoleDto.description,
      updateRoleDto.permissionIds
    );
  }

  // Deletar role
  @Delete('roles/:id')
  @RequirePermissions('DELETE_ROLES')
  @HttpCode(HttpStatus.OK)
  async deleteRole(@Param('id') id: string) {
    return this.superadminService.deleteRole(id);
  }

  // Listar todas as permissões disponíveis
  @Get('permissions')
  @RequirePermissions('VIEW_ROLES')
  async findAllPermissions() {
    return this.superadminService.findAllPermissions();
  }

  // Listar todos os instrutores
  @Get('instructors')
  @RequirePermissions('VIEW_USERS')
  async getInstructors(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
  ) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 10;
    
    return this.superadminService.getInstructors(pageNum, limitNum, search);
  }

  @Get('light-instructors')
  @RequirePermissions('VIEW_USERS')
  async getLightInstructors() {
    return this.superadminService.getLightInstructors();
  }
  
  // Buscar instrutor por ID
  @Get('instructors/:id')
  @RequirePermissions('VIEW_USERS')
  async getInstructorById(@Param('id') id: string) {
    return this.superadminService.getInstructorById(id);
  }

  // Atualizar parcialmente instrutor (PATCH)
  @Patch('instructors/:id')
  @RequirePermissions('EDIT_USERS')
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async patchInstructor(
    @Param('id') id: string,
    @Body() patchDto: Partial<CreateInstructorUserDto>,
  ) {
    return this.superadminService.patchInstructor(id, patchDto);
  }

  // Deletar instrutor
  @Delete('instructors/:id')
  @RequirePermissions('DELETE_USERS')
  @HttpCode(HttpStatus.OK)
  async deleteInstructor(@Param('id') id: string) {
    return this.superadminService.deleteInstructor(id);
  }

  // --- STUDENT CRUD ---

  // Criar novo estudante
  @Post('students')
  @RequirePermissions('CREATE_USERS')
  @HttpCode(HttpStatus.CREATED)
  @UsePipes(new ValidationPipe({ transform: true }))
  async createStudent(@Body() createStudentDto: any) {
    return this.superadminService.createStudent(createStudentDto);
  }

  // Buscar estudante por ID
  @Get('students/:id')
  @RequirePermissions('VIEW_USERS')
  async getStudentById(@Param('id') id: string) {
    return this.superadminService.getStudentById(id);
  }

  // Listar todos os estudantes
  @Get('students')
  @RequirePermissions('VIEW_USERS')
  async getStudents(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
  ) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 10;
    return this.superadminService.getStudents(pageNum, limitNum, search);
  }

  // Atualizar parcialmente estudante (PATCH)
  @Patch('students/:id')
  @RequirePermissions('EDIT_USERS')
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async patchStudent(
    @Param('id') id: string,
    @Body() patchDto: any,
  ) {
    return this.superadminService.patchStudent(id, patchDto);
  }

  // Deletar estudante
  @Delete('students/:id')
  @RequirePermissions('DELETE_USERS')
  @HttpCode(HttpStatus.OK)
  async deleteStudent(@Param('id') id: string) {
    return this.superadminService.deleteStudent(id);
  }


  // --- TRAINING CRUD ---

  // Criar novo treinamento
  @Post('trainings')
  @RequirePermissions('CREATE_USERS')
  @HttpCode(HttpStatus.CREATED)
  @UsePipes(new ValidationPipe({ transform: true }))
  async createTraining(@Body() dto: CreateTrainingDto) {
    return this.superadminService.createTraining(dto);
  }

  // Listar todos os treinamentos
  @Get('trainings')
  @RequirePermissions('VIEW_USERS')
  async getTrainings(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
  ) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 10;
    return this.superadminService.getTrainings(pageNum, limitNum, search);
  }

  // Buscar treinamento por ID
  @Get('trainings/:id')
  @RequirePermissions('VIEW_USERS')
  async getTrainingById(@Param('id') id: string) {
    return this.superadminService.getTrainingById(id);
  }

  // Atualizar parcialmente treinamento (PATCH)
  @Patch('trainings/:id')
  @RequirePermissions('EDIT_USERS')
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async patchTraining(
    @Param('id') id: string,
    @Body() patchDto: Partial<CreateTrainingDto>,
  ) {
    return this.superadminService.patchTraining(id, patchDto);
  }

  // Deletar treinamento
  @Delete('trainings/:id')
  @RequirePermissions('DELETE_USERS')
  @HttpCode(HttpStatus.OK)
  async deleteTraining(@Param('id') id: string) {
    return this.superadminService.deleteTraining(id);
  }


  // --- CLASS CRUD ---

  // Criar nova turma
  @Post('classes')
  @RequirePermissions('CREATE_USERS')
  @HttpCode(HttpStatus.CREATED)
  @UsePipes(new ValidationPipe({ transform: true }))
  async createClass(@Body() createClassDto: CreateClassDto) {
    return this.superadminService.createClass(createClassDto);
  }

  // Buscar turma por ID
  @Get('classes/:id')
  @RequirePermissions('VIEW_USERS')
  async getClassById(@Param('id') id: string) {
    return this.superadminService.getClassById(id);
  }

  // Listar todas as turmas
  @Get('classes')
  @RequirePermissions('VIEW_USERS')
  async getClasses(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
  ) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 10;
    return this.superadminService.getClasses(pageNum, limitNum, search);
  }

  // Atualizar parcialmente turma (PATCH)
  @Patch('classes/:id')
  @RequirePermissions('EDIT_USERS')
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async patchClass(
    @Param('id') id: string,
    @Body() patchDto: PatchClassDto,
  ) {
    return this.superadminService.patchClass(id, patchDto);
  }

  // Deletar turma
  @Delete('classes/:id')
  @RequirePermissions('DELETE_USERS')
  @HttpCode(HttpStatus.OK)
  async deleteClass(@Param('id') id: string) {
    return this.superadminService.deleteClass(id);
  }

  // Adicionar alunos à turma
  @Post('classes/:id/students')
  @RequirePermissions('EDIT_USERS')
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async addStudentsToClass(
    @Param('id') id: string,
    @Body() addStudentsDto: AddStudentsToClassDto,
  ) {
    return this.superadminService.addStudentsToClass(id, addStudentsDto);
  }

  // Remover alunos da turma
  @Delete('classes/:id/students')
  @RequirePermissions('EDIT_USERS')
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async removeStudentsFromClass(
    @Param('id') id: string,
    @Body() removeStudentsDto: RemoveStudentsFromClassDto,
  ) {
    return this.superadminService.removeStudentsFromClass(id, removeStudentsDto);
  }

  // --- LESSON CRUD ---

  @Post('lessons')
  @RequirePermissions('CREATE_USERS')
  @HttpCode(HttpStatus.CREATED)
  @UsePipes(new ValidationPipe({ transform: true }))
  async createLesson(@Body() createLessonDto: CreateLessonDto) {
    return this.superadminService.createLesson(createLessonDto);
  }

  @Get('lessons/:id')
  @RequirePermissions('VIEW_USERS')
  async getLessonById(@Param('id') id: string) {
    return this.superadminService.getLessonById(id);
  }

  @Get('lessons')
  @RequirePermissions('VIEW_USERS')
  async getLessons(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
  ) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 10;
    return this.superadminService.getLessons(pageNum, limitNum, search);
  }

  @Patch('lessons/:id')
  @RequirePermissions('EDIT_USERS')
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async patchLesson(
    @Param('id') id: string,
    @Body() patchDto: PatchLessonDto,
  ) {
    return this.superadminService.patchLesson(id, patchDto);
  }

  @Delete('lessons/:id')
  @RequirePermissions('DELETE_USERS')
  @HttpCode(HttpStatus.OK)
  async deleteLesson(@Param('id') id: string) {
    return this.superadminService.deleteLesson(id);
  }

  // --- LESSON ATTENDANCE CRUD ---

  @Post('lesson-attendances')
  @RequirePermissions('CREATE_USERS')
  @HttpCode(HttpStatus.CREATED)
  @UsePipes(new ValidationPipe({ transform: true }))
  async createLessonAttendance(@Body() createDto: CreateLessonAttendanceDto) {
    return this.superadminService.createLessonAttendance(createDto);
  }

  @Get('lesson-attendances/:id')
  @RequirePermissions('VIEW_USERS')
  async getLessonAttendanceById(@Param('id') id: string) {
    return this.superadminService.getLessonAttendanceById(id);
  }

  @Get('lesson-attendances')
  @RequirePermissions('VIEW_USERS')
  async getLessonAttendances(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
  ) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 10;
    return this.superadminService.getLessonAttendances(pageNum, limitNum, search);
  }

  @Patch('lesson-attendances/:id')
  @RequirePermissions('EDIT_USERS')
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async patchLessonAttendance(
    @Param('id') id: string,
    @Body() patchDto: PatchLessonAttendanceDto,
  ) {
    return this.superadminService.patchLessonAttendance(id, patchDto);
  }

  @Delete('lesson-attendances/:id')
  @RequirePermissions('DELETE_USERS')
  @HttpCode(HttpStatus.OK)
  async deleteLessonAttendance(@Param('id') id: string) {
    return this.superadminService.deleteLessonAttendance(id);
  }

  // --- SIGNATURE CRUD ---

  // Upload de assinatura para instrutor
  @Post('signatures/upload')
  @RequirePermissions('CREATE_USERS')
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(FileInterceptor('signature', {
    storage: diskStorage({
      destination: (req, file, cb) => {
        const uploadPath = './uploads/signatures';
        if (!fs.existsSync(uploadPath)) {
          fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
      },
      filename: (req, file, cb) => {
        const instructorId = req.body.instructorId;
        const fileExtension = extname(file.originalname);
        const filename = `signature-${instructorId}-${Date.now()}${fileExtension}`;
        cb(null, filename);
      },
    }),
    fileFilter: (req, file, cb) => {
      if (!file.mimetype.match(/\/(jpg|jpeg|png)$/)) {
        return cb(new BadRequestException('Apenas arquivos PNG, JPG e JPEG são permitidos'), false);
      }
      cb(null, true);
    },
    limits: {
      fileSize: 5 * 1024 * 1024, // 5MB
    },
  }))
  @UsePipes(new ValidationPipe({ transform: true }))
  async uploadSignature(
    @UploadedFile() file: Express.Multer.File,
    @Body() uploadSignatureDto: UploadSignatureDto,
  ) {
    if (!file) {
      throw new BadRequestException('Arquivo de assinatura é obrigatório');
    }

    return this.superadminService.uploadSignature(
      uploadSignatureDto.instructorId, 
      file.filename
    );
  }

  // Buscar assinatura por ID do instrutor
  @Get('signatures/instructor/:instructorId')
  @RequirePermissions('VIEW_USERS')
  async getSignatureByInstructorId(@Param('instructorId') instructorId: string) {
    return this.superadminService.getSignatureByInstructorId(instructorId);
  }

  // Listar todas as assinaturas
  @Get('signatures')
  @RequirePermissions('VIEW_USERS')
  async getAllSignatures(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
  ) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 10;
    return this.superadminService.getAllSignatures(pageNum, limitNum, search);
  }

  // Deletar assinatura
  @Delete('signatures/instructor/:instructorId')
  @RequirePermissions('DELETE_USERS')
  @HttpCode(HttpStatus.OK)
  async deleteSignature(@Param('instructorId') instructorId: string) {
    return this.superadminService.deleteSignature(instructorId);
  }
}
