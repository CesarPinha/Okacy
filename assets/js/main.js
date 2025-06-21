var settings = {

	banner: {

		// Indicators (= the clickable dots at the bottom).
			indicators: true,

		// Transition speed (in ms)
		// For timing purposes only. It *must* match the transition speed of "#banner > article".
			speed: 1500,

		// Transition delay (in ms)
			delay: 5000,

		// Parallax intensity (between 0 and 1; higher = more intense, lower = less intense; 0 = off)
			parallax: 0.25

	}

};

(function($) {

	skel.breakpoints({
		xlarge:	'(max-width: 1680px)',
		large:	'(max-width: 1280px)',
		medium:	'(max-width: 980px)',
		small:	'(max-width: 736px)',
		xsmall:	'(max-width: 480px)'
	});

	/**
	 * Applies parallax scrolling to an element's background image.
	 * @return {jQuery} jQuery object.
	 */
	$.fn._parallax = (skel.vars.browser == 'ie' || skel.vars.mobile) ? function() { return $(this) } : function(intensity) {

		var	$window = $(window),
			$this = $(this);

		if (this.length == 0 || intensity === 0)
			return $this;

		if (this.length > 1) {

			for (var i=0; i < this.length; i++)
				$(this[i])._parallax(intensity);

			return $this;

		}

		if (!intensity)
			intensity = 0.25;

		$this.each(function() {

			var $t = $(this),
				on, off;

			on = function() {

				$t.css('background-position', 'center 100%, center 100%, center 0px');

				$window
					.on('scroll._parallax', function() {

						var pos = parseInt($window.scrollTop()) - parseInt($t.position().top);

						$t.css('background-position', 'center ' + (pos * (-1 * intensity)) + 'px');

					});

			};

			off = function() {

				$t
					.css('background-position', '');

				$window
					.off('scroll._parallax');

			};

			skel.on('change', function() {

				if (skel.breakpoint('medium').active)
					(off)();
				else
					(on)();

			});

		});

		$window
			.off('load._parallax resize._parallax')
			.on('load._parallax resize._parallax', function() {
				$window.trigger('scroll');
			});

		return $(this);

	};

	/**
	 * Custom banner slider for Slate.
	 * @return {jQuery} jQuery object.
	 */
	$.fn._slider = function(options) {

		var	$window = $(window),
			$this = $(this);

		if (this.length == 0)
			return $this;

		if (this.length > 1) {

			for (var i=0; i < this.length; i++)
				$(this[i])._slider(options);

			return $this;

		}

		// Vars.
			var	current = 0, pos = 0, lastPos = 0,
				slides = [], indicators = [],
				$indicators,
				$slides = $this.children('article'),
				intervalId,
				isLocked = false,
				i = 0;

		// Turn off indicators if we only have one slide.
			if ($slides.length == 1)
				options.indicators = false;

			var touchStartX = 0,
            touchEndX = 0,
            minSwipeDistance = 50;

        // Función para ir a la siguiente diapositiva
        function nextSlide() {
            if (!isLocked) {
                current = (current + 1) % slides.length;
                $this._switchTo(current, true);
                resetInterval();
            }
        }

        // Función para ir a la diapositiva anterior
        function prevSlide() {
            if (!isLocked) {
                current = (current - 1 + slides.length) % slides.length;
                $this._switchTo(current, true);
                resetInterval();
            }
        }

        // Función para reiniciar el intervalo
        function resetInterval() {
            if (intervalId) {
                window.clearInterval(intervalId);
                intervalId = window.setInterval(function() {
                    current = (current + 1) % slides.length;
                    $this._switchTo(current);
                }, options.delay);
            }
        }

        // Eventos de teclado
        $(document).on('keydown', function(e) {
            if (e.key === 'ArrowLeft') {
                prevSlide();
            } else if (e.key === 'ArrowRight') {
                nextSlide();
            }
        });

        // Eventos táctiles
        $this
            .on('touchstart', function(e) {
                touchStartX = e.originalEvent.touches[0].clientX;
            })
            .on('touchend', function(e) {
                touchEndX = e.originalEvent.changedTouches[0].clientX;
                var swipeDistance = touchEndX - touchStartX;

                if (Math.abs(swipeDistance) > minSwipeDistance) {
                    if (swipeDistance > 0) {
                        prevSlide();
                    } else {
                        nextSlide();
                    }
                }
            })
            .on('touchmove', function(e) {
                // Prevenir el scroll mientras se hace swipe
                if (Math.abs(touchEndX - touchStartX) > minSwipeDistance) {
                    e.preventDefault();
                }
            });



		// Functions.
			$this._switchTo = function(x, stop) {

				if (isLocked || pos == x)
					return;

				isLocked = true;

				if (stop)
					window.clearInterval(intervalId);

				// Update positions.
					lastPos = pos;
					pos = x;

				// Hide last slide.
					slides[lastPos].removeClass('top');

					if (options.indicators)
						indicators[lastPos].removeClass('visible');

				// Show new slide.
					slides[pos].addClass('visible').addClass('top');

					if (options.indicators)
						indicators[pos].addClass('visible');

				// Finish hiding last slide after a short delay.
					window.setTimeout(function() {

						slides[lastPos].addClass('instant').removeClass('visible');

						window.setTimeout(function() {

							slides[lastPos].removeClass('instant');
							isLocked = false;

						}, 100);

					}, options.speed);

			};

		// Indicators.
			if (options.indicators)
				$indicators = $('<ul class="indicators"></ul>').appendTo($this);

		// Slides.
			$slides
				.each(function() {

					var $slide = $(this),
						$img = $slide.find('img');

					// Slide.
						$slide
							.css('background-image', 'url("' + $img.attr('src') + '")')
							.css('background-position', ($slide.data('position') ? $slide.data('position') : 'center'));

					// Add to slides.
						slides.push($slide);

					// Indicators.
						if (options.indicators) {

							var $indicator_li = $('<li>' + i + '</li>').appendTo($indicators);

							// Indicator.
								$indicator_li
									.data('index', i)
									.on('click', function() {
										$this._switchTo($(this).data('index'), true);
									});

							// Add to indicators.
								indicators.push($indicator_li);

						}

					i++;

				})
				._parallax(options.parallax);

		// Initial slide.
			slides[pos].addClass('visible').addClass('top');

			if (options.indicators)
				indicators[pos].addClass('visible');

		// Bail if we only have a single slide.
			if (slides.length == 1)
				return;

		// Main loop.
        intervalId = window.setInterval(function() {
            current = (current + 1) % slides.length;
            $this._switchTo(current);
        }, options.delay);

        return $this;
    };

	$(function() {

		var	$window 	= $(window),
			$body 		= $('body'),
			$header 	= $('#header'),
			$banner 	= $('.banner');

			function smoothScrollToTop() {
				window.scrollTo({
					top: 0,
					behavior: 'smooth'
				});
			}

			console.log('Sitio actualizado:', new Date().toLocaleString());

		// Disable animations/transitions until the page has loaded.
			$body.addClass('is-loading');

			$window.on('load', function() {
				window.setTimeout(function() {
					$body.removeClass('is-loading');
				}, 100);
			});

		// Prioritize "important" elements on medium.
			skel.on('+medium -medium', function() {
				$.prioritize(
					'.important\\28 medium\\29',
					skel.breakpoint('medium').active
				);
			});

		// Banner.
			$banner._slider(settings.banner);

		// Menu.
			$('#menu')
				.append('<a href="#menu" class="close"></a>')
				.appendTo($body)
				.panel({
					delay: 500,
					hideOnClick: true,
					hideOnSwipe: true,
					resetScroll: true,
					resetForms: true,
					side: 'right'
				});

		// Header.
			if (skel.vars.IEVersion < 9)
				$header.removeClass('alt');

			if ($banner.length > 0
			&&	$header.hasClass('alt')) {

				$window.on('resize', function() { $window.trigger('scroll'); });

				$banner.scrollex({
					bottom:		$header.outerHeight(),
					terminate:	function() { $header.removeClass('alt'); },
					enter:		function() { $header.addClass('alt'); },
					leave:		function() { $header.removeClass('alt'); $header.addClass('reveal'); }
				});

			}

		// --- AI Chat Floating Button & Widget ---
		// Agregar el botón flotante y el widget de chat al body
		const chatBtn = $('<button id="ai-float-btn" title="¿Necesitas ayuda?"><i class="fa fa-comments"></i></button>');
		const chatWidget = $(`
			<div id="ai-chat-widget">
				<div id="ai-chat-header">
					<span>MoneyTalk</span>
					<button id="ai-chat-close" title="Cerrar">&times;</button>
				</div>
				<div id="ai-chat-messages"></div>
				<form id="ai-chat-input-area" autocomplete="off">
					<input id="ai-chat-input" type="text" placeholder="Escribe tu mensaje..." autocomplete="off" />
					<button id="ai-chat-send" type="submit"><i class="fa fa-paper-plane"></i></button>
				</form>
			</div>
		`);
		$('body').append(chatBtn, chatWidget);

		// Mostrar/ocultar el chat
		chatBtn.on('click', function() {
			chatWidget.toggleClass('open');
			if (chatWidget.hasClass('open')) {
				$('#ai-chat-input').focus();
			}
		});
		$('#ai-chat-close').on('click', function() {
			chatWidget.removeClass('open');
		});

		// Mensaje de bienvenida y opciones iniciales
		function aiWelcome() {
			aiAddMessage('assistant', '👋 ¡Hola! Soy MoneyTalk, tu asistente musical. ¿En qué puedo ayudarte hoy?', [
				'🔊 Recomendaciones de canciones',
				'🎟 Próximos eventos',
				'👕 Merch y promociones',
				'📩 Suscribirme al newsletter',
				'❓ Preguntas frecuentes'
			]);
		}

		// Agregar mensaje al chat
		function aiAddMessage(sender, text, options) {
			const $msg = $('<div>').addClass('ai-msg').addClass(sender === 'user' ? 'ai-user' : 'ai-assistant');
			$msg.append($('<div>').addClass('ai-msg-text').text(text));
			if (options && Array.isArray(options)) {
				const $opts = $('<div>').addClass('ai-msg-options');
				options.forEach(opt => {
					$('<button type="button" class="ai-msg-option">').text(opt).appendTo($opts);
				});
				$msg.append($opts);
			}
			$('#ai-chat-messages').append($msg);
			$('#ai-chat-messages').scrollTop($('#ai-chat-messages')[0].scrollHeight);
		}

		// Analizar input del usuario y responder
		function aiAnalyzeInput(input) {
			input = input.trim().toLowerCase();
			if (input.includes('servicio')) {
				aiAddMessage('assistant', 'Ofrecemos diseño web, marketing digital, integración de AI y más. ¿Te gustaría saber más de algún servicio en particular?', [
					'Diseño web', 'Marketing digital', 'Integración AI', 'Otro'
				]);
			} else if (input.includes('cotiz')) {
				aiAddMessage('assistant', '¡Perfecto! ¿Qué tipo de proyecto te interesa cotizar?', [
					'Sitio web', 'Tienda en línea', 'Automatización AI', 'Otro'
				]);
			} else if (input.includes('asesor')) {
				aiAddMessage('assistant', 'Un asesor humano te contactará pronto. ¿Prefieres WhatsApp o Email?', [
					'WhatsApp', 'Email'
				]);
			} else if (input.includes('ai') || input.includes('inteligencia')) {
				aiAddMessage('assistant', 'La AI puede ayudarte a automatizar tareas, analizar datos y mejorar tus ventas. ¿Te gustaría una recomendación personalizada?', [
					'Sí, por favor', 'No, gracias'
				]);
			} else if (input.length < 3) {
				aiAddMessage('assistant', '¿Podrías darme más detalles o elegir una opción?');
			} else {
				aiAddMessage('assistant', 'Gracias por tu mensaje. Un asesor revisará tu consulta y te responderá pronto. ¿Deseas dejar tus datos de contacto?', [
					'Sí', 'No'
				]);
			}
		}

		// Enviar mensaje
		$('#ai-chat-input-area').on('submit', function(e) {
			e.preventDefault();
			const val = $('#ai-chat-input').val();
			if (!val.trim()) return;
			aiAddMessage('user', val);
			$('#ai-chat-input').val('');
			setTimeout(() => aiAnalyzeInput(val), 600);
		});

		// Click en opciones sugeridas
		$(document).on('click', '.ai-msg-option', function() {
			const val = $(this).text();
			aiAddMessage('user', val);
			setTimeout(() => aiAnalyzeInput(val), 600);
			$('#ai-chat-input').val('');
		});

		// Estilos rápidos para mensajes
		$('<style>').text(`
			#ai-chat-messages { font-family: Poppins, sans-serif; }
			.ai-msg { margin-bottom: 1rem; }
			.ai-user .ai-msg-text { background: #8a4680; color: #fff; border-radius: 16px 16px 4px 16px; padding: 0.5rem 1rem; display: inline-block; float: right; }
			.ai-assistant .ai-msg-text { background: #f1e6f3; color: #333; border-radius: 16px 16px 16px 4px; padding: 0.5rem 1rem; display: inline-block; float: left; }
			.ai-msg-options { margin-top: 0.5rem; clear: both; }
			.ai-msg-option { background: #fff; border: 1px solid #8a4680; color: #8a4680; border-radius: 8px; margin-right: 0.5rem; margin-bottom: 0.5rem; padding: 0.3rem 1rem; cursor: pointer; transition: background 0.2s, color 0.2s; }
			.ai-msg-option:hover { background: #8a4680; color: #fff; }
			.ai-msg:after { content: ''; display: block; clear: both; }
		`).appendTo('head');

		// Lanzar mensaje de bienvenida al abrir el chat por primera vez
		let aiChatWelcomed = false;
		chatBtn.on('click', function() {
			if (!aiChatWelcomed) {
				$('#ai-chat-messages').empty();
				aiWelcome();
				aiChatWelcomed = true;
			}
		});

	});

})(jQuery);