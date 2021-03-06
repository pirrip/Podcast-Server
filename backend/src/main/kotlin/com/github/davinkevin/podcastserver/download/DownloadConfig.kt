package com.github.davinkevin.podcastserver.download

import com.github.davinkevin.podcastserver.manager.ItemDownloadManager
import com.github.davinkevin.podcastserver.messaging.Message
import com.github.davinkevin.podcastserver.messaging.MessagingTemplate
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.context.annotation.Import
import org.springframework.web.reactive.function.server.router
import reactor.core.publisher.DirectProcessor

/**
 * Created by kevin on 17/09/2019
 */
@Configuration
@Import(DownloadHandler::class)
class DownloadRouterConfig {

    @Bean
    fun downloadRouter(d: DownloadHandler) = router {
        POST("/api/v1/podcasts/{idPodcast}/items/{id}/download", d::download)

        "/api/v1/downloads".nest {
            GET("/downloading", d::downloading)

            "/limit".nest {
                GET("", d::findLimit)
                POST("", d::updateLimit)
            }

            POST("/stop", d::stopAll)
            POST("/pause", d::pauseAll)
            POST("/restart", d::restartAll)

            "/{id}".nest {
                POST("/stop", d::stopOne)
                POST("/toggle", d::toggleOne)
            }

            "/queue".nest {
                GET("", d::queue)
                POST("", d::moveInQueue)
                DELETE("/{id}", d::removeFromQueue)
            }
        }
    }

}

@Configuration
@Import(
        DownloadRouterConfig::class,
        ItemDownloadManager::class,
        DownloadRepository::class
)
class DownloadConfig
