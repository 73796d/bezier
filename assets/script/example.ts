let isDne: boolean = false;
let num: number = 21;
let oxnum: number = 0x3232;
let nam: string = "jdjsdjfjsdf";
let hah: string = `ssss`;
let list: number[] = [1, 2, 4];
let arr: Array<number> = [1, 3, 4];
let x: [string, number];
x = ['hello', 20];


enum Color {Red, green, blue};

let c: Color = Color.Red;

let notSure: any = 3;

function xx(): void {

}


let someValue: any = "this is a string";
let len: number = (<string>someValue).length;

let aslen: number = (someValue as string).length;

interface LabelledValue {
    label: string;
}


function printLabel(labelObj: LabelledValue) {
    console.log(labelObj.label);
}

let myObj = {size: 10, label: "size 20 Object"};
// let myObj1 = {size: 10};
printLabel(myObj);
// printLabel(myObj1);

interface SquareConfig {
    color?: string;
    width?: number;
}

interface Point {
    readonly x: number;
    readonly y: number;
}

let p1: Point = {x: 10, y: 20};


let a: number[] = [1, 3, 3, 3];
let ro:ReadonlyArray<number>  = a;

a = ro as number[];

interface ClockInterface {
    currentTime: any;
    setTime(d: any);
}

class Clock implements ClockInterface {
    currentTime: any;
    setTime(d: any) {
        this.currentTime = d;
    }
    constructor(h: number, m: number){}
}

class Greeter {
    greeting: string;
    constructor(message: string){
        this.greeting = message;
    }

    greet(): string {
        return "Hello" + this.greeting;
    }
}

let greeter = new Greeter("World");

class Animal {
    move(distanceInMeters: number = 0) {
        console.log(`Animal movedd ${distanceInMeters}m.`);
    }
}

class Dog extends Animal {
    bark() {
        console.log('woof woof');
    }
}

const dog = new Dog();
dog.bark();
dog.move();


function add(x, y) {
    return x + y;
}

let myAdd = function(x, y) { return x + y; }

let Add: (x: number, y: number) => number = function(x: number, y: number): number {return x + y;};

function identity<T>(arg: T): T {
    return arg;
}
