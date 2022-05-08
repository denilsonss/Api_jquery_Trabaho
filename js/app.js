const URL_API = "http://app.professordaniloalves.com.br";

function limpaCPF() {
    let cpf_com_ponto_e_traco = document.querySelector("#cadastroCpf").value;
    let cpf_sem_ponto_e_traco = cpf_com_ponto_e_traco.replace(".", "").replace(".", "").replace("-", "");
    return cpf_sem_ponto_e_traco
}
function limpaCEP() {
    let cep_com_traco = document.querySelector("#cadastroCep").value;
    let cep_sem_traco = cep_com_traco.replace("-", "");
    return cep_sem_traco
}
/* MENU */
$('.scrollSuave').click(() => {
    $('html, body').animate({
        scrollTop: $(event.target.getAttribute('href')).offset().top - 100
    }, 500);
});


/* ENVIAR CADASTRO */


$("#cadastroDeAcordo").change(function () {
    $("#btnSubmitCadastro").attr("disabled", !this.checked);
});

const formularioCadastro = document.getElementById("formCadastro");
formularioCadastro.addEventListener("submit", enviarFormularioCadastro, true);

function enviarFormularioCadastro(event) {
    event.preventDefault();


    $("#formCadastro .invalid-feedback").remove();
    $("#formCadastro .is-invalid").removeClass("is-invalid");

    fetch(URL_API + "/api/v1/cadastro", {
            method: "POST",
            headers: new Headers({
                Accept: "application/json",
                'Content-Type': "application/json",
            }),
            body: JSON.stringify({

                nomeCompleto: document.getElementById("cadastroNomeCompleto").value,
                dataNascimento: document.getElementById("cadastroDataNascimento").value,
                sexo: document.querySelector("[name=cadastroSexo]:checked").value,
                cpf: limpaCPF(),
                cep: limpaCEP(),
                logradouro: document.getElementById("cadastroLogradouro").value,
                numeroLogradouro: document.getElementById("cadastroNumeroLogradouro").value,
                uf: document.getElementById("cadastroUf").value,
                cidade: document.getElementById("cadastroCidade").value,
                email: document.getElementById("cadastroEmail").value,
            })
        })
        .then(response => {
            return new Promise((myResolve, myReject) => {
                response.json().then(json => {
                    myResolve({
                        "status": response.status,
                        json
                    });
                });
            });
        }).then(response => {
            if (response && response.json.errors) {
                Object.entries(response.json.errors).forEach((obj, index) => {
                    const field = obj[0];
                    const id = "cadastro" + field.charAt(0).toUpperCase() + field.substring(1);
                    const texto = obj[1][0];
                    criarDivDeCampoInvalido(id, texto, index == 0);
                })
            } else {
                $("#cadastro").html(response.json.message);
                $('#modalCadastro').modal('show');
            }
        }).catch(err => {
            alert("Ocorreu um erro não tratado");
            console.log(err);
        });
}

/* FIM ENVIAR CADASTRO */

/* CRIAR LISTA DE ESTADOS */

popularListaEstados();

function popularListaEstados() {
    fetch(URL_API + "/api/v1/endereco/estados", {
            headers: new Headers({
                Accept: "application/json"
            })
        })
        .then(response => {
            return response.json();
        }).then(estados => {
            const elSelecetUF = document.getElementById("cadastroUf");
            estados.forEach((estado) => {
                elSelecetUF.appendChild(criarOption(estado.uf, estado.nome));
            })
        }).catch(err => {
            
            console.log(err);
        })

}

function criarOption(valor, texto) {
    const node = document.createElement("option");
    const textnode = document.createTextNode(texto)
    node.appendChild(textnode);
    node.value = valor;
    return node;
}

/* FIM CRIAR LISTA DE ESTADOS */


/* PREENCHER ENDEREÇO*/
function popularEnderecoCadastro() {
    $(document).ready(function () {

        $("#cadastroCep").blur(function () {

            var cep = $(this).val().replace(/\D/g, '');
            if (cep != "") {

                var validacep = /^[0-9]{8}$/;
                if (validacep.test(cep)) {
                    $.getJSON(URL_API + "/api/v1/endereco/{cep}" + cep, function (dados) {

                        if (!("erro" in dados)) {

                            $("#cadastroLogradouro").val(dados.logradouro);
                            $("#cadastroCidade").val(dados.localidade);
                            $("#cadastroUf").val(dados.uf);
                        } else {

                            limpa_formulário_cep();
                            alert("CEP não encontrado.");
                        }
                    });
                } else {
                    limpa_formulário_cep();
                    alert("Formato de CEP inválido.");
                }
            } else {

                limpa_formulário_cep();
            }
        });
    });

}
/* FIM PREENCHER ENDEREÇO */

/* IMC */

$('#btnCalcularIMC').click(() => {
    $("#resultadoIMC").html("");
    $("#formImc .invalid-feedback").remove();
    $("#formImc .is-invalid").removeClass("is-invalid");

    fetch(URL_API + "/api/v1/imc/calcular", {
            method: "POST",
            headers: new Headers({
                Accept: "application/json",
                'Content-Type': "application/json",
            }),
            body: JSON.stringify({
                peso: document.getElementById("pesoImc").value,
                altura: document.getElementById("alturaImc").value,
            })
        })
        .then(response => {
            return new Promise((myResolve, myReject) => {
                response.json().then(json => {
                    myResolve({
                        "status": response.status,
                        json
                    });
                });
            });
        }).then(response => {
            if (response && response.json.errors) {
                Object.entries(response.json.errors).forEach((obj, index) => {
                    const id = parseIdImc(obj[0]);
                    const texto = obj[1][0];
                    criarDivImcDeCampoInvalido(id, texto, index == 0);
                })
            } else {
                $("#resultadoIMC").html(response.json.message);
                $('#modalResultadoIMC').modal('show');
            }
        }).catch(err => {
            $("#resultadoIMC").html("Ocorreu um erro ao tentar calcular seu IMC.");
            $('#modalResultadoIMC').modal('show');
            console.log(err);
        });

});

function parseIdImc(id) {
    return id + "Imc";
}

/* FIM IMC */

function criarDivDeCampoInvalido(idItem, textoErro, isFocarNoCampo) {
    const el = document.getElementById(idItem);
    isFocarNoCampo && el.focus();
    el.classList.add("is-invalid");
    const node = document.createElement("div");
    const textnode = document.createTextNode(textoErro);
    node.appendChild(textnode);
    const elDiv = el.parentElement.appendChild(node);
    elDiv.classList.add("invalid-feedback");
}