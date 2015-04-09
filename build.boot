(set-env!
  :source-paths #{"src" "checkouts/vee/src/cljs"}
  :test-paths #{"test"}
  :resource-paths #{}
  :dependencies '[[org.clojure/clojure "1.6.0"]
                  [org.clojure/clojurescript "0.0-2850"]
                  [nsfw "0.8.12" :exclusions [org.clojure/clojure]]
                  [vee "0.0.7" :exclusions [nsfw]]])

(require '[vee.server :as vee-server])

(deftask reload-vee-cljs
  [s source-paths code "CLJS mobile source paths"
   c compiler code "CLJS mobile compiler opts"]
  (fn [next-task]
    (fn [fileset]
      (vee-server/start-app
        {:source-paths source-paths
         :compiler compiler})
      (next-task fileset))))

(deftask dev []
  (comp
    (repl :server true)
    (reload-vee-cljs
      :source-paths ["src"]
      :compiler {:output-to "Resources/cljs-out/app.js"
                 :output-dir "Resources/cljs-out"
                 :source-map true
                 :optimizations :none})
    (watch)))
