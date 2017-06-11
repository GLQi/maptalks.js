describe('#VectorLayer', function () {

    var container;
    var map;
    var layer;
    var center = new maptalks.Coordinate(118.846825, 32.046534);

    beforeEach(function () {
        container = document.createElement('div');
        container.style.width = '800px';
        container.style.height = '600px';
        document.body.appendChild(container);
        var option = {
            zoom: 17,
            center: center,
            centerCross : true
        };
        map = new maptalks.Map(container, option);
        layer = new maptalks.VectorLayer('id');
    });

    afterEach(function () {
        map.remove();
        REMOVE_CONTAINER(container);
    });

    describe('creation', function () {
        it('create', function () {
            var layer = new maptalks.VectorLayer('v');
            expect(layer.getCount()).to.be.eql(0);
        });

        it('create with geometries', function () {
            var layer = new maptalks.VectorLayer('v', { 'cursor' : 'default' });
            expect(layer.getCount()).to.be.eql(0);
            expect(layer.options['cursor']).to.be.eql('default');
        });

        it('create with geometries', function () {
            var layer = new maptalks.VectorLayer('v', [new maptalks.Marker(map.getCenter()), new maptalks.Marker(map.getCenter())], { 'cursor' : 'default' });
            expect(layer.getCount()).to.be.eql(2);
            expect(layer.options['cursor']).to.be.eql('default');
        });
    });

    describe('add to map', function () {
        it('fire layerload when empty', function (done) {
            layer = new maptalks.VectorLayer('v');
            layer.on('layerload', function () {
                expect(layer.getCount()).to.be(0);
                done();
            });
            map.addLayer(layer);
        });

        it('add again', function (done) {
            layer = new maptalks.VectorLayer('v')
                .addGeometry(new maptalks.Marker(map.getCenter())).addTo(map);
            expect(layer.getCount()).to.be(1);
            map.removeLayer(layer);
            expect(layer.getCount()).to.be(1);
            layer.on('layerload', function () {
                expect(layer.getCount()).to.be(1);
                expect(layer).to.be.painted(0, -5);
                done();
            });
            map.addLayer(layer);
        });

        it('add, hide and show', function (done) {
            layer = new maptalks.VectorLayer('v')
                .addGeometry(new maptalks.Marker(map.getCenter())).hide().addTo(map);
            layer.on('layerload', function () {
                expect(layer.getCount()).to.be(1);
                expect(layer).to.be.painted(0, -5);
                done();
            });
            layer.show();
        });
    });

    describe('can addGeometry', function () {
        beforeEach(function () {
            map.addLayer(layer);
        });

        afterEach(function () {
            map.removeLayer(layer);
        });

        it('empty geometries', function () {
            expect(function () {
                layer.addGeometry([], true);
                layer.addGeometry(null, true);
                layer.addGeometry();
            }).to.not.throwException();

        });

        it('all type of geometry', function (done) {
            var geometries = GEN_GEOMETRIES_OF_ALL_TYPES();
            map.on('zoomend', function () {
                done();
            });
            layer.on('layerload', function () {
                map.on('zoomend', function () {
                    map.panBy(new maptalks.Point(1, 1));
                });
                map.zoomOut();
            });
            expect(function () {
                layer.addGeometry(geometries, true);
            }).to.not.throwException();
        });

        it('add a geometry with id of 0', function () {
            layer.addGeometry(new maptalks.Marker([0, 0], { id:0 }));
            var geo = layer.getGeometryById(0);
            expect(geo).to.be.ok();
        });

        it('add FeatureCollection', function () {
            var collection = {
                'type': 'FeatureCollection',
                'features': [
                    { 'type': 'Feature',
                        'geometry': { 'type': 'Point', 'coordinates': [102.0, 0.5] },
                        'properties': { 'prop0': 'value0' }
                    },
                    { 'type': 'Feature',
                        'geometry': {
                            'type': 'LineString',
                            'coordinates': [
                              [102.0, 0.0], [103.0, 1.0], [104.0, 0.0], [105.0, 1.0]
                            ]
                        },
                        'properties': {
                            'prop0': 'value0',
                            'prop1': 0.0
                        }
                    },
                    { 'type': 'Feature',
                        'geometry': {
                            'type': 'Polygon',
                            'coordinates': [
                                [[100.0, 0.0], [101.0, 0.0], [101.0, 1.0],
                                [100.0, 1.0], [100.0, 0.0]]
                            ]
                        },
                        'properties': {
                            'prop0': 'value0',
                            'prop1': { 'this': 'that' }
                        }
                    }
                ]
            };
            layer = new maptalks.VectorLayer('v', collection);
            expect(layer.getCount()).to.be.eql(collection.features.length);
        });
    });

    describe('paint geometry', function () {
        beforeEach(function () {
            layer = new maptalks.VectorLayer('id');
            map.addLayer(layer);
        });

        afterEach(function () {
            map.removeLayer(layer);
        });

        it('paint a geometry', function (done) {
            var circle = new maptalks.Circle(map.getCenter(), 100, {
                symbol : {
                    'polygonFill' : '#f00'
                }
            });
            layer.on('layerload', function () {
                expect(layer).to.be.painted(0, 0, [255, 0, 0]);
                done();
            });
            layer.addGeometry(circle);
        });

        it('update symbol', function (done) {
            var circle = new maptalks.Circle(map.getCenter(), 100, {
                symbol : {
                    'polygonFill' : '#f00'
                }
            });
            layer.once('layerload', function () {
                layer.once('layerload', function () {
                    expect(layer).to.be.painted(0, 0, [0, 255, 0]);
                    done();
                });
                circle.setSymbol({
                    'polygonFill' : '#0f0'
                });

            });
            layer.addGeometry(circle);
        });

        it('show', function (done) {
            var circle = new maptalks.Circle(map.getCenter(), 100, {
                symbol : {
                    'polygonFill' : '#f00'
                },
                visible : false
            });
            layer.once('layerload', function () {
                expect(layer).not.to.be.painted(0, 0);
                layer.once('layerload', function () {
                    expect(layer).to.be.painted(0, 0);
                    done();
                });
                circle.show();

            });
            layer.addGeometry(circle);
        });

        it('hide', function (done) {
            var circle = new maptalks.Circle(map.getCenter(), 100, {
                symbol : {
                    'polygonFill' : '#f00'
                }
            });
            layer.once('layerload', function () {
                expect(layer).to.be.painted(0, 0);
                layer.once('layerload', function () {
                    expect(layer).not.to.be.painted(0, 0);
                    done();
                });
                circle.hide();

            });
            layer.addGeometry(circle);
        });

        it('remove', function (done) {
            var circle = new maptalks.Circle(map.getCenter(), 100, {
                symbol : {
                    'polygonFill' : '#f00'
                }
            });
            layer.once('layerload', function () {
                expect(layer).to.be.painted(0, 0);
                layer.once('layerload', function () {
                    expect(layer).not.to.be.painted(0, 0);
                    done();
                });
                circle.remove();

            });
            layer.addGeometry(circle);
        });

        it('change position', function (done) {
            var circle = new maptalks.Circle(map.getCenter(), 100, {
                symbol : {
                    'polygonFill' : '#f00'
                }
            });
            layer.once('layerload', function () {
                expect(layer).to.be.painted(0, 0);
                layer.once('layerload', function () {
                    expect(layer).not.to.be.painted(0, 0);
                    done();
                });
                circle.setCoordinates([0, 0]);

            });
            layer.addGeometry(circle);
        });

        it('change shape', function (done) {
            var circle = new maptalks.Circle(map.getCenter(), 100, {
                symbol : {
                    'polygonFill' : '#f00'
                }
            });
            layer.once('layerload', function () {
                expect(layer).to.be.painted(0, 0);
                layer.once('layerload', function () {
                    expect(layer).not.to.be.painted(0, 0);
                    done();
                });
                circle.setRadius(0);
            });
            layer.addGeometry(circle);
        });

        it('change zindex', function (done) {
            var circle1 = new maptalks.Circle(map.getCenter(), 100, {
                symbol : {
                    'polygonFill' : '#f00'
                }
            });
            var circle2 = new maptalks.Circle(map.getCenter(), 100, {
                symbol : {
                    'polygonFill' : '#0f0'
                }
            });
            layer.once('layerload', function () {
                expect(layer).to.be.painted(0, 0, [0, 255, 0]);
                layer.once('layerload', function () {
                    expect(layer).to.be.painted(0, 0, [255, 0, 0]);
                    done();
                });
                circle1.bringToFront();
            });
            layer.addGeometry([circle1, circle2]);
        });

        it('change properties', function (done) {
            layer.setStyle([{
                filter : ['==', 'foo', 1],
                symbol : {
                    'polygonFill' : '#f00'
                }
            },
            {
                filter : ['==', 'foo', 2],
                symbol : {
                    'polygonFill' : '#0f0'
                }
            }]);
            var circle = new maptalks.Circle(map.getCenter(), 100, {
                properties : {
                    'foo' : 1
                }
            });
            layer.once('layerload', function () {
                expect(layer).to.be.painted(0, 0, [255, 0, 0]);
                layer.once('layerload', function () {
                    expect(layer).to.be.painted(0, 0, [0, 255, 0]);
                    done();
                });
                circle.setProperties({
                    'foo' : 2
                });
            });
            layer.addGeometry(circle);
        });
    });

    describe('can setStyle', function () {
        function testStyle(style, hitIndex, symbols) {
            layer.clear();
            var points = [
                new maptalks.Marker([0, 0], {
                    properties : {
                        'foo1' : 1,
                        'foo2' : 'test1',
                        'foo3' : true
                    }
                }),
                new maptalks.Marker([0, 0], {
                    properties : {
                        'foo1' : 2,
                        'foo2' : 'test2',
                        'foo3' : false
                    }
                }),
                new maptalks.Marker([0, 0], {
                    properties : {
                        'foo1' : 3,
                        'foo2' : 'test3',
                        'foo3' : true
                    }
                }),
                new maptalks.Marker([0, 0], {
                    properties : {
                        'foo1' : 4,
                        'foo2' : 'test4',
                        'foo3' : true
                    }
                }),
                new maptalks.Circle([0, 0], 100, {
                    properties : {
                        'foo1' : 5,
                        'foo2' : 'test5',
                        'foo3' : true
                    }
                })
            ];

            var defaultSymbols = [];
            layer.addGeometry(points).forEach(function (geometry) {
                defaultSymbols.push(geometry.getSymbol());
            }).setStyle(style);

            expect(layer.getStyle()).to.be.eql(style);
            var i;
            for (i = 0; i < points.length; i++) {
                var hit = hitIndex.indexOf(i);
                if (hitIndex.indexOf(i) >= 0) {
                    expect(points[i]._getInternalSymbol()).to.be.eql(symbols[hit]);
                } else {
                    expect(points[i].getSymbol()).to.be.eql(defaultSymbols[i]);
                }
            }

            var geoAddLater = points[hitIndex[0]].copy();
            geoAddLater.setSymbol(null);
            layer.addGeometry(geoAddLater);
            expect(geoAddLater._getInternalSymbol()).to.be.eql(symbols[0]);

            var profile = layer.toJSON();
            for (i = 0; i < profile.geometries.length; i++) {
                expect(profile.geometries[i].symbol).not.to.be.ok();
            }

            layer.removeStyle();

            expect(layer.getStyle()).not.to.be.ok();

            for (i = 0; i < points.length; i++) {
                expect(points[i].getSymbol()).to.be.eql(defaultSymbols[i]);
            }
            expect(geoAddLater.getSymbol()).to.be.eql(defaultSymbols[0]);
        }

        it('setStyle with a singleStyle', function () {
            var symbol = {
                'markerFile' : 'http://www.foo.com/foo.png'
            };
            testStyle({
                filter : [
                    'all',
                            ['==', 'foo1', 2],
                            ['==', '$type', 'Point']
                ],
                symbol : symbol
            }, [1], [symbol]);
        });

        it('setStyle with an array of styles', function () {
            var symbol = {
                'markerFile' : 'http://www.foo.com/foo.png'
            };
            var symbol2 = {
                'markerFile' : 'http://www.foo.com/foo2.png'
            };
            testStyle([
                {
                    filter : ['==', 'foo1', 2],
                    symbol : symbol
                },
                {
                    filter : [
                        'all',
                                ['!=', '$type', 'Polygon'],
                                ['==', 'foo1', 3]
                    ],
                    symbol : symbol2
                },
            ], [1, 2], [symbol, symbol2]);
        });
        it('symbol first', function () {
            var symbol = {
                'markerType' : 'ellipse',
                'markerWidth' : 20,
                'markerHeight' : 20
            };
            var styleSymbol = {
                'markerFile' : 'http://www.foo.com/foo.png'
            };
            var vectors = new maptalks.VectorLayer('symbol-style', { 'drawImmediate' : true })
                        .setStyle({
                            filter : ['==', '$type', 'Point'],
                            symbol : styleSymbol
                        })
                        .addTo(map);
            var geometries = [
                new maptalks.Marker(map.getCenter(), {
                    'symbol' : symbol
                }),
                new maptalks.Marker(map.getCenter()),
            ];
            vectors.addGeometry(geometries);
            expect(geometries[0].getSymbol()).to.be.eql(symbol);
            expect(geometries[0]._getInternalSymbol()).to.be.eql(symbol);
            expect(geometries[1].getSymbol()).not.to.be.ok();
            expect(geometries[1]._getInternalSymbol()).to.be.eql(styleSymbol);
            vectors.removeStyle();
            expect(geometries[0].getSymbol()).to.be.eql(symbol);
            expect(geometries[0]._getInternalSymbol()).to.be.eql(symbol);
            expect(geometries[1].getSymbol()).not.to.be.ok();
            expect(geometries[1]._getInternalSymbol()).not.to.be.eql(styleSymbol);
        });
    });

    describe('render geometry with height', function () {
        it('circle', function (done) {
            var circle = new maptalks.Circle(map.getCenter(), 2, {
                properties : { height : 200 },
                symbol : {
                    'polygonFill' : '#f00'
                }
            });
            layer.config('enableHeight', true);
            layer.addGeometry(circle);
            map.setPitch(60);
            layer.once('layerload', function () {
                expect(layer).not.to.be.painted(0, 0);
                expect(layer).to.be.painted(0, -192);
                done();
            });
            map.addLayer(layer);
        });

        it('marker', function (done) {
            var marker = new maptalks.Marker(map.getCenter(), {
                properties : { height : 100 },
                symbol : {
                    'markerType' : 'ellipse',
                    'markerHeight' : 6,
                    'markerWidth' : 6
                }
            });
            layer.config('enableHeight', true);
            layer.addGeometry(marker);
            map.setPitch(60);
            layer.once('layerload', function () {
                expect(layer).not.to.be.painted(0, 0);
                expect(layer).to.be.painted(0, -93);
                done();
            });
            map.addLayer(layer);
        });
    });

});
