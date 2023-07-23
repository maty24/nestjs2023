import { ExecutionContext, InternalServerErrorException, createParamDecorator } from "@nestjs/common";

export const GetUser = createParamDecorator(

    //la data es el argumento que le envio al decorator
    (data,ctx:ExecutionContext) => {
        //el ctx es como se encutra nest en este momento
      // console.log({data});


       const req = ctx.switchToHttp().getRequest();
       //estoy sacando el usuario de la request
       const user = req.user;

       if(!user)
       throw new InternalServerErrorException('User not found ')
       //si no trae la data la envio el usuario
       return ( !data ) 
       ? user 
       : user[data];
    }
);