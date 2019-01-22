$(document).ready(function() {

    Vue.component('todo-item', {
        props: ['todo'],
        template: '<button :id="todo.color" type="button" class="btn btn-outline-light">' +
            '<img :src="\'/assets/images/\' + todo.color + \'_king.png\'">' +
            '</button>'
    })

    new Vue({
        el: '#colorSelect',
        data: {
            colorList: [
                { id: 0, color: 'white' },
                { id: 1, color: 'black' }
            ]
        }
    })
});