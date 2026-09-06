import { injectable, inject } from "tsyringe";
import { ErrorMessages } from "../../../shared/constants/ErrorMessages";
import { NewUser } from "../../../domain/entities/User";
import { logger } from "../../../infrastructure/logger/logger";

import { RegisterUserRequestDTO, RegisterUserResponseDTO } from "../../dtos/user/RegisterUserDTO";

import { IUserRepository } from "../../../domain/repositories/IUserRepository";
import { IOtpRepository } from "../../../domain/repositories/IOtpRepository";
import { IHashService } from "../../../domain/services/IHashService";
import { IOtpService } from "../../../domain/services/IOtpService";
import { IEmailService } from "../../../domain/services/IEmailService";
import { UserMapper } from "../../mappers/UserMapper";
import { IRegisterUserUseCase } from "../../ports/user/IRegisterUserUseCase";
import { UserRole } from "workbee-common";

@injectable()
export class RegisterUserUseCase implements IRegisterUserUseCase {
  constructor(
    @inject("UserRepository") private readonly _userRepository: IUserRepository,
    @inject("OtpRepository") private readonly _otpRepository: IOtpRepository,
    @inject("HashService") private readonly _hashService: IHashService,
    @inject("OtpService") private readonly _otpService: IOtpService,
    @inject("EmailService") private readonly _emailService: IEmailService
  ) { }

  async execute(data: RegisterUserRequestDTO): Promise<RegisterUserResponseDTO> {
    // console.log('hited apl leyer')
    const { name, email, phone, password } = data;
    const existing = await this._userRepository.findByEmail(email);
    if (existing && existing.isVerified) throw new Error(ErrorMessages.USER.ALREADY_EXISTS);

    const hashed = await this._hashService.hash(password);

    const user: NewUser = {
      name,
      email,
      phone,
      password: hashed,
      role: UserRole.USER,
      isVerified: false,
    };
    // console.log(user)
    const savedUser = await this._userRepository.save(user)

    const otp = this._otpService.generateOtp().toString()

    logger.info("otp", {otp});
    logger.info("otppppppppppp");
    console.log(otp)
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
    await this._otpRepository.save({
      userId: savedUser.id!,
      otp,
      expiresAt
    });
    // console.log(savedUser,'nnnnnnnnn');
    await this._emailService.sendOtp(email, otp)

    logger.info(`otp sent to ${email}`);

    return UserMapper.toRegisterResponse(savedUser.id!);

  }
}
