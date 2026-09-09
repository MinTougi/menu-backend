import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { GuestCheck, GuestCheckStatus } from './guest-check.entity';
import { CreateGuestCheckDto } from './dto/create-guest-check';
import { Spot } from '../spots/spot.entity';

@Injectable()
export class GuestCheckService {
  constructor( 
    @InjectRepository(GuestCheck) 
      private readonly guestcheckRepository: Repository<GuestCheck>, 

    @InjectRepository(Spot) 
      private readonly spotRepository: Repository<Spot> 
        
    ) {}  

    async create(dto: CreateGuestCheckDto): Promise<GuestCheck> {

        //Regra 1: não se abre comanda em mesa inexistente
        const spot = await this.spotRepository.findOneBy({ 
          id: dto.spotID,
          active: true
        });

      if (!spot){
        throw new NotFoundException('Não foi encontrada uma mesa ativa com este ID');
      }

      //Regra 2: Não se abre comanda em mesa que já tenha comanda aberta
      const opened = await this.guestcheckRepository.exists({
        where: { spot: { id: dto.spotID }, status: GuestCheckStatus.OPENED}
      });
      
      if(opened){
        throw new ConflictException('A mesa já possui uma comanda aberta');
      }

      //Se chegou aqui, deu boa...grava o registro
      const guestCheck = this.guestcheckRepository.create({
        spot,
        status: GuestCheckStatus.OPENED
      });

      return this.guestcheckRepository.save(guestCheck);
    }

    //Método FindOne 
    async findOne(id: string): Promise<GuestCheck> {
            const guestCheck = await this.guestcheckRepository.findOneBy({id});
    
            if(!guestCheck) {
                throw new NotFoundException(`Comanda não encontrada!`);
            }
            
            return guestCheck;
        }

    async close(id: string): Promise<GuestCheck>{

        const guestCheck = await this.findOne(id);

        //Regra 1: fecha-se apenas comandas abertas
        if(guestCheck.status === GuestCheckStatus.CLOSED){
            throw new BadRequestException('A comanda já está fechada');
        }

        //Regra 2: não se fecha uma comanda com pedidos pendentes (não entregues)
        //TO_DO: implementar dps (dívida técnica)

        //Se chegou aqui, deu boa...fecha a comanda
        guestCheck.status = GuestCheckStatus.CLOSED;

        return this.guestcheckRepository.save(guestCheck);
    }
}