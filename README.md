Bix invoice
----

Simple formato de cuenta de cobro o factura

Basado en formato de [simple-html-invoice-template](https://github.com/sparksuite/simple-html-invoice-template)


## Como usarlo

1. instala el modulo globalmente `npm i -g bix-invoice`
2. Crea un archivo .json con la información, ej

        {
          "header": {
            "title": "Cuenta de cobro", // Opcional
            "left": [ // Opcional
              "<strong>Nombre</strong>: Julian Reyes",              
              "<strong>Telefono</strong>: (+57) 555 123 4567"
            ],
            "right": [ // Opcional
              "<strong>Paypal</strong>",
              "julian.reyes.escrigas@gmail.com"
            ]
          },
          "items": [ // Requerido al menos un item
            {
              "description":  "Instalacion de instancia ec2",
              "qty": 1,
              "value": 600
            },,
            {
              "description": "Adelanto",
              "qty": 1,
              "value": -300
            }
          ],
          "signature": {
            "line": "Julian Reyess", // Opcional
            "file": "./sample-signature.png" // Opcional, absoluto o relativo al .json
          }
        }
        
3. Ejecuta `$ simple-invoice ruta-archivo.json`

4. Formato, por defecto genera un PDF pero tambien es posible especificar HTML como formato de salida

    $ simple-invoice ruta-archivo.json html    