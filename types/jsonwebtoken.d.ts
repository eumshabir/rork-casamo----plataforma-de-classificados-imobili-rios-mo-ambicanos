declare module 'jsonwebtoken' {
  export interface JwtPayload {
    userId: string;
    [key: string]: any;
  }

  export function sign(
    payload: string | Buffer | object,
    secretOrPrivateKey: string | Buffer,
    options?: {
      algorithm?: string;
      expiresIn?: string | number;
      notBefore?: string | number;
      audience?: string | string[];
      issuer?: string;
      jwtid?: string;
      subject?: string;
      noTimestamp?: boolean;
      header?: object;
      keyid?: string;
      mutatePayload?: boolean;
      [key: string]: any;
    }
  ): string;

  export function verify(
    token: string,
    secretOrPublicKey: string | Buffer,
    options?: {
      algorithms?: string[];
      audience?: string | RegExp | Array<string | RegExp>;
      clockTimestamp?: number;
      clockTolerance?: number;
      complete?: boolean;
      issuer?: string | string[];
      ignoreExpiration?: boolean;
      ignoreNotBefore?: boolean;
      jwtid?: string;
      nonce?: string;
      subject?: string;
      maxAge?: string | number;
      [key: string]: any;
    }
  ): JwtPayload | string;

  export function decode(
    token: string,
    options?: {
      complete?: boolean;
      json?: boolean;
    }
  ): null | JwtPayload | string;
}