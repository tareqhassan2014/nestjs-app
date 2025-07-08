import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';

import { User } from '@/user/entities/user.entity';

@Injectable()
export class CourseGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user as User;

    if (!user) {
      return false;
    }

    return user.hasCourseAccess;
  }
}
