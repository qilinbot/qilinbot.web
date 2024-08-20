import {Buffer} from "buffer";

export class ObjectId {
    //保存递增的计数器
    static index = ~~(Math.random() * 0xffffff);

    //自增器
    static getInc() {
        return (ObjectId.index = (ObjectId.index + 1) % 0xffffff);
    }
    static randomBytes(size:number) {
        const result = new Uint8Array(size);
        for (let i = 0; i < size; ++i) result[i] = Math.floor(Math.random() * 256);
        return result;
    }

  /**
   * 生成一个12位的16进制数
   * `前四位采用时间戳 中间五位采用随机数 后位采用自增值`
   */
  static create() {
        let time = ~~(Date.now() / 1000);
        const inc = ObjectId.getInc();
        const buffer:Buffer = Buffer.alloc(12);

        // 4-byte timestamp
        buffer[3] = time & 0xff;
        buffer[2] = (time >> 8) & 0xff;
        buffer[1] = (time >> 16) & 0xff;
        buffer[0] = (time >> 24) & 0xff;

        let PROCESS_UNIQUE = ObjectId.randomBytes(5);
        // 5-byte process unique
        buffer[4] = PROCESS_UNIQUE[0];
        buffer[5] = PROCESS_UNIQUE[1];
        buffer[6] = PROCESS_UNIQUE[2];
        buffer[7] = PROCESS_UNIQUE[3];
        buffer[8] = PROCESS_UNIQUE[4];

        // 3-byte counter
        buffer[11] = inc & 0xff;
        buffer[10] = (inc >> 8) & 0xff;
        buffer[9] = (inc >> 16) & 0xff;

        return buffer.toString('hex');
    }
}
