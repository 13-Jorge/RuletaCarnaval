$(document).ready(() => {
    var options = [
      "0",
      "28",
      "9",
      "26",
      "30",
      "11",
      "7",
      "20",
      "32",
      "17",
      "5",
      "22",
      "34",
      "15",
      "3",
      "24",
      "36",
      "13",
      "1",
      "00",
      "27",
      "10",
      "25",
      "29",
      "12",
      "8",
      "19",
      "31",
      "18",
      "6",
      "21",
      "33",
      "16",
      "4",
      "23",
      "35",
      "14",
      "2",
    ]
  
    var startAngle = 0
    var arc = Math.PI / (options.length / 2)
    var spinTimeout = null
    var spinAngleStart = 10
    var spinTime = 0
    var spinTimeTotal = 0
    var ctx
  
    function drawRouletteWheel() {
      var canvas = document.getElementById("canvas")
      if (canvas.getContext) {
        var outsideRadius = 200
        var textRadius = 160
        var insideRadius = 120
  
        ctx = canvas.getContext("2d")
        ctx.clearRect(0, 0, 500, 500)
  
        ctx.strokeStyle = "black"
        ctx.lineWidth = 2
        ctx.font = "bold 14px Arial"
  
        for (var i = 0; i < options.length; i++) {
          var angle = startAngle + i * arc
          ctx.fillStyle = getColor(options[i])
  
          ctx.beginPath()
          ctx.arc(250, 250, outsideRadius, angle, angle + arc, false)
          ctx.arc(250, 250, insideRadius, angle + arc, angle, true)
          ctx.fill()
          ctx.stroke()
  
          ctx.save()
          ctx.fillStyle = "white"
          ctx.translate(250 + Math.cos(angle + arc / 2) * textRadius, 250 + Math.sin(angle + arc / 2) * textRadius)
          ctx.rotate(angle + arc / 2 + Math.PI / 2)
          var text = options[i]
          ctx.fillText(text, -ctx.measureText(text).width / 2, 0)
          ctx.restore()
        }
  
        // Flecha
        ctx.fillStyle = "gold"
        ctx.beginPath()
        ctx.moveTo(250 - 5, 250 - (outsideRadius + 10))
        ctx.lineTo(250 + 5, 250 - (outsideRadius + 10))
        ctx.lineTo(250 + 5, 250 - (outsideRadius - 10))
        ctx.lineTo(250 - 5, 250 - (outsideRadius - 10))
        ctx.fill()
      }
    }
  
    function getColor(number) {
      if (number === "0" || number === "00") return "green"
      var redNumbers = [
        "9",
        "30",
        "7",
        "32",
        "5",
        "34",
        "3",
        "36",
        "1",
        "27",
        "25",
        "12",
        "19",
        "18",
        "21",
        "16",
        "23",
        "14",
      ]
      return redNumbers.includes(number) ? "red" : "black"
    }

    function checkNumberProperties(number) {
      const properties = {
          isEven: false,
          isOdd: false,
          isInFirstHalf: false,
          isInSecondHalf: false,
          dozen: null,
          isDoubleZero: false
      };
  
      if (number === "00") {
          properties.isDoubleZero = true;
      } else {
          const num = parseInt(number);
          if (!isNaN(num)) {
              properties.isEven = num % 2 === 0;
              properties.isOdd = !properties.isEven;
              properties.isInFirstHalf = num >= 1 && num <= 18;
              properties.isInSecondHalf = num >= 19 && num <= 36;
  
              if (num >= 1 && num <= 12) {
                  properties.dozen = "1st 12";
              } else if (num >= 13 && num <= 24) {
                  properties.dozen = "2nd 12";
              } else if (num >= 25 && num <= 36) {
                  properties.dozen = "3rd 12";
              }
          }
      }
  
      return properties;
  }
  
    function spin() {
      $("#ruletaSound")[0].play()
      $("#result").html("")
      spinAngleStart = Math.random() * 10 + 10
      spinTime = 0
      spinTimeTotal = Math.random() * 3 + 4 * 1000
      $("#spin").prop("disabled", true) // Disable spin button
      rotateWheel()
    }
  
    function rotateWheel() {
      spinTime += 30
      if (spinTime >= spinTimeTotal) {
        stopRotateWheel()
        return
      }
      var spinAngle = spinAngleStart - easeOut(spinTime, 0, spinAngleStart, spinTimeTotal)
      startAngle += (spinAngle * Math.PI) / 180
      drawRouletteWheel()
      spinTimeout = setTimeout(rotateWheel, 30)
    }
  
    let totalChipsWon = 0
    let totalChipsLost = 0
    let totalBalance = 0
    let canPlaceBets = true;
  
    const updateBalanceDisplay = () => {
      $("#chipsWon").text(totalChipsWon)
      $("#chipsLost").text(totalChipsLost)
      $("#totalBalance").text(totalBalance)
      updateBalanceWithEffect()
    }
  
    const updateSpinResultsDisplay = (results, balanceChange) => {
      const resultsContainer = $("#spinResults")
      resultsContainer.empty()
      results.forEach((result) => {
        resultsContainer.append(`<li>${result}</li>`)
      })
      const balanceText = balanceChange > 0 ? `+${balanceChange}` : balanceChange < 0 ? `${balanceChange}` : "0"
      resultsContainer.append(`<li><strong>Balance de la Tirada: ${balanceText}</strong></li>`)
    }
  
    function checkWinningBets(winningNumber) {
      let spinResults = [];
      let chipsWon = 0;
      let chipsLost = 0;
    
      const winningProperties = checkNumberProperties(winningNumber);
    
      $(".casilla").each(function () {
        const casilla = $(this);
        const betNumber = casilla.data("numero");
        const chipCount = casilla.data("chipCount") || 0;
    
        if (chipCount > 0) {
          let winnings = 0;
    
          if (betNumber == winningNumber) {
            winnings = chipCount * 17; // Reduced factor for straight-up bet
          } else if (betNumber == "red" && getColor(winningNumber) == "red") {
            winnings = chipCount * 1;
          } else if (betNumber == "black" && getColor(winningNumber) == "black") {
            winnings = chipCount * 1;
          } else if (betNumber == "par" && winningProperties.isEven) {
            winnings = chipCount * 1;
          } else if (betNumber == "impar" && winningProperties.isOdd) {
            winnings = chipCount * 1;
          } else if (betNumber == "1-18" && winningProperties.isInFirstHalf) {
            winnings = chipCount * 1;
          } else if (betNumber == "19-36" && winningProperties.isInSecondHalf) {
            winnings = chipCount * 1;
          } else if (betNumber == "1st 12" && winningProperties.dozen === "1st 12") {
            winnings = chipCount * 2;
          } else if (betNumber == "2nd 12" && winningProperties.dozen === "2nd 12") {
            winnings = chipCount * 2;
          } else if (betNumber == "3rd 12" && winningProperties.dozen === "3rd 12") {
            winnings = chipCount * 2;
          }
    
          if (winnings > 0) {
            chipsWon += winnings;
            spinResults.push(`Ganaste ${winnings} ${winnings === 1 ? 'ficha' : 'fichas'} en ${betNumber}`);
          } else {
            chipsLost += chipCount;
            spinResults.push(`Perdiste ${chipCount} ${chipCount === 1 ? 'ficha' : 'fichas'} en ${betNumber}`);
          }
        }
      });
    
      totalChipsWon += chipsWon;
      totalChipsLost += chipsLost;
      const balanceChange = chipsWon - chipsLost;
      totalBalance += balanceChange;
    
      updateBalanceDisplay();
      updateSpinResultsDisplay(spinResults, balanceChange);
    }
  
    function stopRotateWheel() {
      clearTimeout(spinTimeout)
      var degrees = (startAngle * 180) / Math.PI + 90
      var arcd = (arc * 180) / Math.PI
      var index = Math.floor((360 - (degrees % 360)) / arcd)
      ctx.save()
      ctx.font = "bold 48px Arial"
      var text = options[index]
      ctx.fillStyle = "white"
      ctx.fillText(text, 250 - ctx.measureText(text).width / 2, 270)
      $("#winSound")[0].play()
      ctx.restore()
  
      checkWinningBets(text) // Check winning bets after the wheel stops
    }
  
    function easeOut(t, b, c, d) {
      var ts = (t /= d) * t
      var tc = ts * t
      return b + c * (tc + -3 * ts + 3 * t)
    }
  
    $("#spin").click(spin)
  
    drawRouletteWheel()
    const generarMesa = () => {
      const mesa = $(".mesa-de-apuestas")
      mesa.empty()
  
      // Dozens row
      const dozensRow = $('<div class="dozens-row"></div>')
      dozensRow.append('<div class="casilla empty"></div>') // Empty cell for alignment
      dozensRow.append('<button class="casilla dozens" data-numero="1st 12">1st 12</button>')
      dozensRow.append('<button class="casilla dozens" data-numero="2nd 12">2nd 12</button>')
      dozensRow.append('<button class="casilla dozens" data-numero="3rd 12">3rd 12</button>')
      mesa.append(dozensRow)
  
      // Numbers section
      const numbersSection = $('<div class="numbers-section"></div>')
  
      // Zero column
      const zeroColumn = $('<div class="zero-column"></div>')
      zeroColumn.append('<button class="casilla verde" data-numero="0">0</button>')
      zeroColumn.append('<button class="casilla verde" data-numero="00">00</button>')
      numbersSection.append(zeroColumn)
  
      // Numbers grid
      const numbersGrid = $('<div class="numbers-grid"></div>')
      const numerosOrdenados = [
        [3, 6, 9, 12, 15, 18, 21, 24, 27, 30, 33, 36],
        [2, 5, 8, 11, 14, 17, 20, 23, 26, 29, 32, 35],
        [1, 4, 7, 10, 13, 16, 19, 22, 25, 28, 31, 34],
      ]
  
      for (let row = 0; row < 3; row++) {
        for (let col = 0; col < 12; col++) {
          const num = numerosOrdenados[row][col]
          const colorClass = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36].includes(num)
            ? "red"
            : "black"
          numbersGrid.append(`<button class="casilla ${colorClass}" data-numero="${num}">${num}</button>`)
        }
      }
      numbersSection.append(numbersGrid)
      mesa.append(numbersSection)
  
      // Special bets row
      const specialBets = $('<div class="special-bets"></div>')
      specialBets.append('<div class="casilla empty"></div>') // Empty cell for alignment
      specialBets.append('<button class="casilla verde" data-numero="1-18">1 to 18</button>')
      specialBets.append('<button class="casilla verde" data-numero="par">PAR</button>')
      specialBets.append('<button class="casilla" data-numero="red"><div class="rombo red"></div></button>')
      specialBets.append('<button class="casilla" data-numero="black"><div class="rombo black"></div></button>')
      specialBets.append('<button class="casilla verde" data-numero="impar">IMPAR</button>')
      specialBets.append('<button class="casilla verde" data-numero="19-36">19 to 36</button>')
      mesa.append(specialBets)
  
      mesa.on("click", ".casilla:not(.empty)", function () {
        if (!canPlaceBets) return; // Prevent placing bets if not allowed
        const chipAmount = Number.parseInt($("#chipAmount").val()) || 0
        const casilla = $(this)
        if (chipAmount > 0) {
          let chipCount = casilla.data("chipCount") || 0
          chipCount += chipAmount
          casilla.data("chipCount", chipCount)
  
          casilla.find(".chip, .clear-bet").remove()
          casilla.append(`<div class="chip">${chipCount}</div>`)
          casilla.append('<div class="clear-bet"><i class="fas fa-broom"></i></div>')
  
          $("#chipsSound")[0].play()
          updateSpinButtonState(); // Update spin button state
          $(this).addClass("animate__animated animate__heartBeat")
          setTimeout(() => {
            $(this).removeClass("animate__animated animate__heartBeat")
          }, 1000)
        }
      })
  
      mesa.on("click", ".clear-bet", function (e) {
        e.stopPropagation()
        const casilla = $(this).closest(".casilla")
        casilla.data("chipCount", 0)
        casilla.find(".chip, .clear-bet").remove()
        updateSpinButtonState(); // Update spin button state
      })
    }
  
    const checkBetsOnTable = () => {
      let hasBets = false;
      $(".casilla").each(function () {
        if ($(this).data("chipCount") > 0) {
          hasBets = true;
          return false; // Exit loop early
        }
      });
      return hasBets;
    };
    
    const updateSpinButtonState = () => {
      if (checkBetsOnTable()) {
        $("#spin").prop("disabled", false);
      } else {
        $("#spin").prop("disabled", true);
      }
    };
    
    const clearBets = () => {
      $(".casilla").each(function () {
        $(this).data("chipCount", 0);
        $(this).find(".chip, .clear-bet").remove(); // Remove both chip and clear-bet elements
      });
      updateSpinButtonState(); // Update spin button state
    };
    
    const resetGame = () => {
      totalChipsWon = 0;
      totalChipsLost = 0;
      totalBalance = 0;
      updateBalanceDisplay();
      $("#spinResults").empty();
      clearBets();
      ctx.clearRect(0, 0, 500, 500); // Clear the canvas
      startAngle = 0; // Reset the start angle
      drawRouletteWheel(); // Redraw the roulette wheel
      $("#result").html("Número ganador reiniciado. ¡Buena suerte!"); // Display reset message
      canPlaceBets = true; // Allow placing bets again
    };
    
    $("#resetGame").click(() => {
      resetGame();
      $(".mesa-de-apuestas").addClass("animate__animated animate__fadeOut");
      setTimeout(() => {
        $(".mesa-de-apuestas").removeClass("animate__animated animate__fadeOut");
        $(".mesa-de-apuestas").addClass("animate__animated animate__fadeIn");
      }, 500);
      setTimeout(() => {
        $(".mesa-de-apuestas").removeClass("animate__animated animate__fadeIn");
      }, 1000);
    });
    
    $("#clearBets").click(clearBets);
    
    $("#spin").click(() => {
      $("#clearBets").hide();
      $("#spinAgain").show();
      $("#spin").prop("disabled", true);
      canPlaceBets = false; // Prevent placing bets after spinning
      spin();
    
      // Scroll to top on smaller screens
      if ($(window).width() < 768) {
        $("html, body").animate({ scrollTop: 0 }, "slow");
      }
    });
    
    $("#spinAgain").click(() => {
      $("#clearBets").show();
      $("#spinAgain").hide();
      clearBets();
      startAngle = 0; // Reset the start angle
      drawRouletteWheel(); // Redraw the roulette wheel
      $("#result").html("Número ganador reiniciado. ¡Buena suerte!"); // Display reset message
      updateSpinButtonState(); // Update spin button state
      canPlaceBets = true; // Allow placing bets again
    });
  
    // Añadir efectos visuales a los botones
    $(".game-controls .btn").hover(
      function () {
        $(this).addClass("animate__animated animate__pulse")
      },
      function () {
        $(this).removeClass("animate__animated animate__pulse")
      },
    )
  
    // Mejorar la animación del botón de giro
    $("#spin").click(function () {
      $(this).addClass("animate__animated animate__rotateIn")
      setTimeout(() => {
        $(this).removeClass("animate__animated animate__rotateIn")
      }, 1000)
    })

  
    // Inicializar tooltips para una mejor experiencia de usuario
    $('[data-toggle="tooltip"]').tooltip()
  
    generarMesa()
    $("#spin").prop("disabled", true) // Deshabilitar el botón de giro inicialmente
    updateBalanceDisplay() // Inicializar la visualización del balance
  
    function updateBalanceWithEffect() {
      $("#totalBalance").addClass("animate__animated animate__flash")
      setTimeout(() => {
        $("#totalBalance").removeClass("animate__animated animate__flash")
      }, 1000)
    }
  })

