
const store  = {
  state:{
    count:10
  },
  // 进行commit操作
  mutations:{
    increment(state,payload) {
      state.count += payload.count
    }
  },
  getters:{
    count2(state){
      return state.count + 10
    }
  },
  // 进行伊布操作
  actions:{
    asyncIncrement({commit}) {
      return new Promise((resolve,reject) => {
        setTimeout(() => {
          resolve(commit('increment',{
            count:20
          }))
        },1000)
      })
    }
  }
}
