import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CompleteTaskInstanceDto } from './dto/complete-task-instance.dto';
import { GetTaskInstancesDto } from './dto/get-task-instances.dto';
import { PaginatedTaskInstancesDto } from './dto/paginated-task-instances.dto';
import { SyncDataDto } from './dto/sync-data.dto';
import { SyncResultDto } from './dto/sync-result.dto';
import { TaskInstanceDto } from './dto/task-instance.dto';
import { MobileAppService } from './mobile-app.service';

@ApiTags('Mobile App')
@Controller('mobile-app')
export class MobileAppController {
  constructor(private readonly mobileAppService: MobileAppService) {}

  @Get('task-instances/:patientId')
  @ApiOperation({ summary: 'Get paginated task instances for a patient' })
  @ApiResponse({
    status: 200,
    description: 'Paginated list of task instances',
    type: PaginatedTaskInstancesDto,
  })
  async getTaskInstancesForPatient(
    @Param('patientId') patientId: string,
    @Query() getTaskInstancesDto: GetTaskInstancesDto,
  ): Promise<PaginatedTaskInstancesDto> {
    const { taskInstances, total } =
      await this.mobileAppService.getTaskInstancesForPatient(
        patientId,
        getTaskInstancesDto.startDate,
        getTaskInstancesDto.endDate,
        getTaskInstancesDto.page,
        getTaskInstancesDto.limit,
        getTaskInstancesDto.lastSyncTimestamp,
      );
    return {
      taskInstances: taskInstances.map((instance) =>
        this.mapTaskInstanceToDto(instance),
      ),
      total,
      page: getTaskInstancesDto.page,
      limit: getTaskInstancesDto.limit,
    };
  }

  @Post('complete-task-instance')
  @ApiOperation({ summary: 'Mark a task instance as completed' })
  @ApiResponse({
    status: 200,
    description: 'Task instance marked as completed',
    type: TaskInstanceDto,
  })
  async completeTaskInstance(
    @Body() completeTaskDto: CompleteTaskInstanceDto,
  ): Promise<TaskInstanceDto> {
    const completedInstance = await this.mobileAppService.completeTaskInstance(
      completeTaskDto.taskInstanceId,
    );
    return this.mapTaskInstanceToDto(completedInstance);
  }

  @Get('completed-task-instances/:patientId')
  @ApiOperation({ summary: 'Get completed task instances for a patient' })
  @ApiResponse({
    status: 200,
    description: 'Paginated list of completed task instances',
    type: PaginatedTaskInstancesDto,
  })
  async getCompletedTaskInstances(
    @Param('patientId') patientId: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
  ): Promise<PaginatedTaskInstancesDto> {
    const { taskInstances, total } =
      await this.mobileAppService.getCompletedTaskInstancesForPatient(
        patientId,
        page,
        limit,
      );
    return {
      taskInstances: taskInstances.map((instance) =>
        this.mapTaskInstanceToDto(instance),
      ),
      total,
      page,
      limit,
    };
  }

  @Post('sync/:patientId')
  @ApiOperation({ summary: 'Sync data with the mobile app' })
  @ApiResponse({ status: 200, description: 'Sync result', type: SyncResultDto })
  async sync(
    @Param('patientId') patientId: string,
    @Body() syncData: SyncDataDto,
  ): Promise<SyncResultDto> {
    // Process completed task instances
    const completedInstances =
      await this.mobileAppService.batchCompleteTaskInstances(
        syncData.completedTaskInstances.map((item) => item.taskInstanceId),
      );

    // Fetch updated task instances
    const { taskInstances } =
      await this.mobileAppService.getTaskInstancesForPatient(
        patientId,
        new Date(),
        new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
        1,
        1000,
        syncData.lastSyncTimestamp,
      );

    const newSyncTimestamp = new Date();

    const uniqueTaskInstances = [
      ...completedInstances,
      ...taskInstances,
    ].reduce((uniqueInstances, instance) => {
      const existingInstance = uniqueInstances.find(
        (i) => i.id === instance._id.toString(),
      );

      if (!existingInstance) {
        uniqueInstances.push(this.mapTaskInstanceToDto(instance));
      }
      return uniqueInstances;
    }, []);

    return {
      updatedTaskInstances: uniqueTaskInstances,
      newSyncTimestamp,
    };
  }

  private mapTaskInstanceToDto(instance: any): TaskInstanceDto {
    return {
      id: instance._id.toString(),
      title: instance.title,
      description: instance.description,
      date: instance.date,
      time: instance.time,
      completed: instance.completed,
      createdAt: instance.createdAt,
      updatedAt: instance.updatedAt,
    };
  }
}
