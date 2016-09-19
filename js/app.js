var app6 = new Vue({
    el: '#app-6',
    data: {
        message: 'Hello Vue!'
    },
  created: function () {
    // `this` points to the vm instance
    console.log('Creation message is: ' + this.message)
  },
  updated: function () {
    // `this` points to the vm instance
    console.log('Update message is: ' + this.message)
  }
})

app6.$watch('message', function (newVal, oldVal) {
  // this callback will be called when `vm.a` changes
  console.log('"'+oldVal+'" become "'+newVal+'"');
})
