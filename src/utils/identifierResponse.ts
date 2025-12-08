import { ApiProperty } from '@nestjs/swagger';

export class identifierResponse {
  @ApiProperty({
    description: 'true or false',
  })
  isUserPresent: boolean;
  @ApiProperty({
    description: 'email',
  })
  email: string;
  @ApiProperty()
  applicationFound: boolean;
  @ApiProperty({
    description: 'examid',
  })
  examid: string;
  @ApiProperty({
    description: 'jobid',
  })
  job: string;
  @ApiProperty({
    description: 'name',
  })
  name?: string;
  @ApiProperty({
    description: 'phone',
  })
  phone?: string;
  @ApiProperty({
    description: 'gender',
  })
  gender?: string;
  @ApiProperty({
    description: 'application CV is present or not',
  })
  applicationCV?: boolean;
}
