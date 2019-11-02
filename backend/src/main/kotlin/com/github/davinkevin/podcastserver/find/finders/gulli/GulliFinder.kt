package com.github.davinkevin.podcastserver.find.finders.gulli

import com.github.davinkevin.podcastserver.entity.Podcast
import com.github.davinkevin.podcastserver.extension.java.util.orNull
import com.github.davinkevin.podcastserver.find.FindCoverInformation
import com.github.davinkevin.podcastserver.find.FindPodcastInformation
import com.github.davinkevin.podcastserver.find.finders.fetchCoverInformationOrOption
import com.github.davinkevin.podcastserver.manager.worker.Finder
import org.jsoup.Jsoup
import org.jsoup.nodes.Document
import org.springframework.web.reactive.function.client.WebClient
import org.springframework.web.reactive.function.client.bodyToMono
import reactor.core.publisher.Mono
import reactor.kotlin.core.publisher.toMono
import reactor.kotlin.core.util.function.component1
import reactor.kotlin.core.util.function.component2
import java.net.URI
import java.util.*
import com.github.davinkevin.podcastserver.service.image.ImageServiceV2 as ImageService

class GulliFinder(
        private val client: WebClient,
        private val image: ImageService
): Finder {

    override fun find(url: String): Podcast = TODO("not required anymore")

    override fun findInformation(url: String): Mono<FindPodcastInformation> {
        val path = url.substringAfterLast("replay.gulli.fr")

        return client
                .get()
                .uri(path)
                .retrieve()
                .bodyToMono<String>()
                .map { Jsoup.parse(it, url) }
                .flatMap { findCover(it).zipWith(it.toMono()) }
                .map { (cover, d) -> FindPodcastInformation(
                    title = d.select("ol.breadcrumb li.active").first().text(),
                    cover = cover.orNull(),
                    description = d.select("meta[property=og:description]").attr("content"),
                    url = URI(d.select("meta[property=og:url]").attr("content")),
                    type = "Gulli"
                ) }
    }

    private fun findCover(d: Document): Mono<Optional<FindCoverInformation>> {
        val pageUrl = d.select("meta[property=og:url]").attr("content")

        val imgTag = d.select("div.program_gullireplay a[href=$pageUrl] img")
                .firstOrNull() ?: return Optional.empty<FindCoverInformation>().toMono()

        return image.fetchCoverInformationOrOption(URI(imgTag.attr("src")))
    }

    override fun compatibility(url: String?) =
            if ((url ?: "").contains("replay.gulli.fr")) 1
            else Integer.MAX_VALUE

}
