import { IsString, IsDateString, IsInt, Min, Max } from 'class-validator';

export class CreateTaskDto {
  @IsString()
  name: string;

  @IsDateString()
  dueDate: string;

  @IsInt()
  @Min(1)
  @Max(5)
  priority: number;
}
