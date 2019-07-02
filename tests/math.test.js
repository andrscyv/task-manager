

test('Async test demo', (done ) =>{
    setTimeout( () => {
        expect(2).toBe(2)
        done()
    },2000)

    
})