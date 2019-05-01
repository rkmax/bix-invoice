Bix invoice
----

Simple formato de cuenta de cobro o factura

Basado en formato de [simple-html-invoice-template](https://github.com/sparksuite/simple-html-invoice-template)


## Como usarlo

1. instala el modulo globalmente `npm i -g bix-invoice`, puede omitir este paso si usas npx
2. Crea un archivo .json con la información, ej

        {
          "header": {
            "title": "Cuenta de cobro"
          },
          "items": [
            {
              "description":  "Licencia modulo de cuentas de cobro",
              "qty": 1,
              "value": 1500
            }
          ],
          "recipient": {
            "name": "Enterprise LLC",
            "document": "RUT 123.456.7489" //optional
          },
          "sender": {
            "name": "Julian Reyes",
            "document": "C.C. 1.890.234.567" // optional
          },
          "signature": { // optional
            "file": "/path/to/my-signature.png"
          },
          "data": { // optional
            "left": [
              "<br>",
              "<strong>Datos de consignación</strong>",
              "<strong>Direccion</strong>: CL 100 44 - 10, Barranquilla Colombia",
              "<strong>Telefono</strong>: (+57) 300 555 5515",
              "<strong>Cuenta de Ahorros</strong>: COLOCOBM 123-123456-78"
            ]
          }
        }

        
3. Ejecuta `$ bix-invoice ruta-archivo.json` o `npx bix-invoice ruta-archivo.json`

4. Formato, por defecto genera un PDF pero tambien es posible especificar HTML como formato de salida

    $ bix-invoice ruta-archivo.json html    
