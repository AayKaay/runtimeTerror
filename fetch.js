const func = () => {fetch("http://3.7.252.32:8080/hello",{
    method:"GET"
}).then(res => console.log(res))
.catch(err => console.log(err))
}

func()