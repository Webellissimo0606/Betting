import nodeResolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';

class RollupNG2 {
  constructor(options){
    this.options = options;
  }
  resolveId(id, from){
    if (id.startsWith('rxjs/')){
      return `${__dirname}/node_modules/rxjs-es/${id.replace('rxjs/', '')}.js`;
    }
  }
}

const rollupNG2 = (config) => new RollupNG2(config);

export default {
  entry: 'app/main-ngc.js',
  sourceMap: false,
  moduleName: 'bundle',
  plugins: [
    rollupNG2(),
    commonjs({
        include: [
'./node_modules/ng2-dnd/**', 
'./node_modules/ng2-bs3-modal/**',
],
        namedExports: {
'./node_modules/ng2-bs3-modal/ng2-bs3-modal.js': ['ModalComponent']
}
    }),
    nodeResolve({
      jsnext: true, main: true
    })
  ]
};
