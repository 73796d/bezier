export class Bezier {
    pointList: any[] = null; // 控制点
    time: number = null; // 总时长
    count: number = null; // 生成点的数量
    lut:any = [
        [1],
        [1, 1],
        [1, 2, 1],
        [1, 3, 3, 1],
        [1, 4, 6, 4, 1],
        [1, 5, 10, 10, 5, 1],
        [1, 6, 15, 20, 15, 6, 1],
    ]; // look-up-table

    constructor(controllerPoints: any[], count: number, time: number) {
        this.pointList = controllerPoints;
        this.time = time;
        this.count = count;
    }

    // t 在区间[0, 1]上的点
    private pointForBezier(cp: any, t: any): cc.Vec2 {
        let result = new cc.Vec2();
        let n = cp.length;
        for (let i = 0; i < n; i++) {
            let b = this.bernstein(n - 1, i, t);
            result.x += cp[i].x * b;
            result.y += cp[i].y * b;
        }
        return result;
    }

    // 计算numberOfPoints个数的点
    private computeBezier(cp: any[], numberOfPoints: number, curve: any[]) {
        let dt = 1.0 / (numberOfPoints - 1);
        for (let i = 0; i < numberOfPoints; i++) {
            curve[i] = this.pointForBezier(cp, i * dt);
        }
    }

    // 获取count个曲线上的点
    getPoints(count?: any): cc.Vec2[] {
        let curve = [];
        let currentCount = this.count;
        if (count) {
            currentCount = count;
        }
        this.computeBezier(this.pointList, currentCount, curve);
        return curve;
    }

    // 获取曲线上的点
    getPoint(t: number): cc.Vec2 {
        if (t > this.time) {
            return null;
        }
        let result: cc.Vec2 = new cc.Vec2();
        let n: number = this.pointList.length;
        for (let i = 0; i < n; i++) {
            let b = this.bernstein(n - 1, i, t / this.time);
            result.x += this.pointList[i].x * b;
            result.y += this.pointList[i].y * b;
        }
        return result;
    }

    // 基函数(伯恩斯坦多项式)
    bernstein(n: number, k: number, t: number): number {
        // return this.combination(n, k) * Math.pow(t, k) * Math.pow(1 - t, n - k);
        return this.binomial(n, k) * Math.pow(t, k) * Math.pow(1 - t, n - k); // 幂运算优化可采用快速幂
    }

    // 二项式系数采用组合(阶乘的方式)开销比较大, 可以采用查表
    binomial(n: number, k: number) {
        while (n >= this.lut.length) {
            let len = this.lut.length;
            let nextRow: any[] = [];
            nextRow[0] = 1;
            for (let i = 1, prev = len - 1; i < len; i++) {
                nextRow[i] = this.lut[prev][i - 1] + this.lut[prev][i];
            }
            nextRow[len] = 1;
            this.lut.push(nextRow);
        }
        return this.lut[n][k];
    }

    // 组合 C(n, k) = C(n, n-k) = n! / (k! * (n - k)!)  (0 < k <= n)
    combination(n: number, k: number) {
        let numerator: number = this.factorial(n); // 分子
        let denominator: number = this.factorial(k) * this.factorial(n - k); // 分母
        return numerator / denominator;
    }

    // 阶乘, 可以试试斯特灵公式
    factorial(i: number): number {
        let n: number = 1;
        for (let j: number = 1; j <= i; j++) {
            n *= j;
        }
        return n;
    }
}

