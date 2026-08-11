import {
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import ms from 'ms';
import { jwtExpiresIn, msDuration } from '../../common/types/jwt-expires-in';
import { AppConfig } from '../../config/configuration';
import { JwtAccessPayload } from '../../common/interfaces/jwt-access-payload.interface';
import { generateOpaqueToken, hashOpaqueToken } from '../../common/utils/token.util';
import { User } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';
import { RefreshToken } from './entities/refresh-token.entity';
import { AuthTokensDto } from './dto/auth-tokens.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService<AppConfig, true>,
    @InjectRepository(RefreshToken)
    private readonly refreshTokensRepository: Repository<RefreshToken>,
  ) {}

  async login(email: string, password: string): Promise<AuthTokensDto> {
    const user = await this.usersService.findByEmail(email);
    if (!user || !user.isActive) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const passwordValid = await this.usersService.validatePassword(user, password);
    if (!passwordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.issueTokens(user);
  }

  async refresh(refreshToken: string): Promise<AuthTokensDto> {
    const pepper = this.configService.get('jwt', { infer: true }).refreshSecret;
    const tokenHash = hashOpaqueToken(refreshToken, pepper);
    const stored = await this.refreshTokensRepository.findOne({
      where: { tokenHash },
      relations: ['user'],
    });

    if (!stored) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    if (stored.revokedAt) {
      await this.revokeAllForUser(stored.userId);
      throw new UnauthorizedException('Refresh token reuse detected');
    }

    if (stored.expiresAt.getTime() <= Date.now()) {
      stored.revokedAt = new Date();
      await this.refreshTokensRepository.save(stored);
      throw new UnauthorizedException('Refresh token expired');
    }

    const user = stored.user;
    if (!user.isActive) {
      throw new UnauthorizedException('User is inactive');
    }

    stored.revokedAt = new Date();
    await this.refreshTokensRepository.save(stored);

    return this.issueTokens(user);
  }

  async logout(refreshToken: string): Promise<void> {
    const pepper = this.configService.get('jwt', { infer: true }).refreshSecret;
    const tokenHash = hashOpaqueToken(refreshToken, pepper);
    const stored = await this.refreshTokensRepository.findOne({
      where: { tokenHash, revokedAt: IsNull() },
    });

    if (!stored) {
      return;
    }

    stored.revokedAt = new Date();
    await this.refreshTokensRepository.save(stored);
  }

  private async issueTokens(user: User): Promise<AuthTokensDto> {
    const jwtConfig = this.configService.get('jwt', { infer: true });
    const payload: JwtAccessPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      type: 'access',
    };

    const accessToken = await this.jwtService.signAsync(payload, {
      secret: jwtConfig.accessSecret,
      expiresIn: jwtExpiresIn(jwtConfig.accessExpiresIn),
    });

    const decoded = this.jwtService.decode(accessToken);
    const expiresIn =
      typeof decoded === 'object' &&
      decoded !== null &&
      'exp' in decoded &&
      typeof decoded.exp === 'number'
        ? decoded.exp - Math.floor(Date.now() / 1000)
        : 0;

    const opaqueRefresh = generateOpaqueToken();
    const refreshTtlMs = ms(msDuration(jwtConfig.refreshExpiresIn));
    if (typeof refreshTtlMs !== 'number') {
      throw new Error('Invalid JWT_REFRESH_EXPIRES_IN');
    }

    const refreshEntity = this.refreshTokensRepository.create({
      userId: user.id,
      tokenHash: hashOpaqueToken(opaqueRefresh, jwtConfig.refreshSecret),
      expiresAt: new Date(Date.now() + refreshTtlMs),
      revokedAt: null,
    });
    await this.refreshTokensRepository.save(refreshEntity);

    return {
      accessToken,
      refreshToken: opaqueRefresh,
      expiresIn,
      tokenType: 'Bearer',
    };
  }

  private async revokeAllForUser(userId: string): Promise<void> {
    await this.refreshTokensRepository.update(
      { userId, revokedAt: IsNull() },
      { revokedAt: new Date() },
    );
  }
}
