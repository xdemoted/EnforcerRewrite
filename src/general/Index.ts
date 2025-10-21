import { Main } from "src/enforcer/Main";
import Talos from "src/talos/Index";

class Index {
    static instance: Index;
    
    private main = Main.getInstance();
    private talos = Talos.getInstance();

    private constructor() {
        
    }

    static getInstance(): Index {
        if (!Index.instance) this.instance = new Index();
        return Index.instance;
    }
}

Index.getInstance();