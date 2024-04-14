import { Injectable } from '@nestjs/common';
import { PassportSerializer } from '@nestjs/passport';
import { UserResponseDto } from 'src/modules/users/dto/user-response.dto';

@Injectable()
export class SessionSerializer extends PassportSerializer {
  serializeUser(
    user: UserResponseDto,
    done: (err: Error | null, user: any) => void,
  ): any {
    const filteredUser = {
      email: user.email,
      id: user.id,
    };
    done(null, filteredUser);
  }
  deserializeUser(
    payload: any,
    done: (err: Error | null, payload: string) => void,
  ): any {
    console.log('Deserialize User', payload);
    done(null, payload);
  }
}
